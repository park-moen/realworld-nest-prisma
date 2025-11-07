import { AuthService } from '@app/auth/service/auth.service';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/request/create-user.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';
import { UserMapper } from '../user.mapper';
import { UserRepository } from '../repository/user.repository';
import { LoginUserDto } from '../dto/request/login-user.dto';
import { UpdateUserDto } from '../dto/request/update-user.dto';
import {
  EmailAlreadyExistsError,
  EmailMismatchError,
  PasswordMismatchError,
  UserNotFoundError,
} from '@app/common/errors/user-domain.error';

type UpdatePayload = Partial<{
  username: string;
  email: string;
  password: string;
  image: string | null;
  bio: string | null;
}>;

@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password } = createUserDto;

    const userExists = await this.userRepository.findByEmail(email);
    // ! UserRepository의 prisma에 의존하고 있어서 EmailAlreadyExistsError에서 Error를 잡지 않고
    // ! prisma 자체 Error를 반환한다. prisma가 직접 Error를 관리하는게 맞을까?
    // ! 위의 원인은 동일한 username에 대한 방어 코드가 없어서 prisma에서 바로 http protocol error로 바로 던짐.
    if (userExists) {
      throw new EmailAlreadyExistsError(createUserDto.email);
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

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ result: UserResponseDto; refreshToken: string }> {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new EmailMismatchError();
    }

    const ok = await this.authService.compare(password, user.password);
    if (!ok) {
      throw new PasswordMismatchError();
    }

    const { accessToken, refreshToken } =
      await this.authService.issueRefreshToken(user.id);

    const clear = UserMapper.toClearUserDto(user, accessToken);

    return {
      result: UserMapper.toUserResponse(clear),
      refreshToken: refreshToken,
    };
  }

  async getUserCurrent(
    userId: string | undefined,
    accessToken: string | undefined,
  ): Promise<any> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const clear = UserMapper.toClearUserDto(user, accessToken);

    return UserMapper.toUserResponse(clear);
  }

  // ! 동일한 username, email인 경우 Throw Error & Image, bio는 사용자가 삭제할 수 있음.
  async updateUser(updateUserDto: UpdateUserDto, token: string) {
    const { sub: userId } = this.authService.verifyAccessToken(token);
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    let passwordHashed: string | undefined = undefined;
    if (updateUserDto.password || updateUserDto.passwordOld) {
      const ok = await this.authService.compare(
        updateUserDto.passwordOld,
        user.password,
      );

      if (!ok) {
        throw new PasswordMismatchError();
      }

      passwordHashed = await this.authService.hash(updateUserDto.password);
    }

    const payload: UpdatePayload = {
      username: updateUserDto.username,
      email: updateUserDto.email,
      password: passwordHashed,
      image: updateUserDto.image ?? undefined,
      bio: updateUserDto.bio ?? undefined,
    };

    const updateUser = await this.userRepository.update(userId, payload);

    const clear = UserMapper.toClearUserDto(updateUser, token);

    return UserMapper.toUserResponse(clear);
  }

  async refresh(oldToken: string) {
    return this.authService.rotateRefresh(oldToken);
  }
}
