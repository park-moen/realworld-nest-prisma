import { AuthService } from '@app/auth/auth.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/request/create-user.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';
import { UserMapper } from '../user.mapper';
import { UserRepository } from '../repository/user.repository';
import { LoginUserDto } from '../dto/request/login-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password } = createUserDto;

    const userExists = await this.userRepository.findByEmail(email);
    if (userExists) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const passwordHashed = await this.authService.hash(password);

    const user = await this.userRepository.create({
      ...createUserDto,
      password: passwordHashed,
    });
    const token = this.authService.signAccessToken(user.id);
    const clear = UserMapper.toClearUserDto(user, token);

    return UserMapper.toUserResponse(clear);
  }

  async login(loginUserDto: LoginUserDto): Promise<UserResponseDto> {
    const INVALID = new HttpException(
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED,
    );
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw INVALID;
    }

    const ok = await this.authService.compare(password, user.password);
    if (!ok) {
      throw INVALID;
    }

    const token = this.authService.signAccessToken(user.id);
    const clear = UserMapper.toClearUserDto(user, token);

    return UserMapper.toUserResponse(clear);
  }
}
