import { AuthService } from '@app/auth/service/auth.service';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/request/create-user.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';
import { UserMapper } from '../user.mapper';
import { UserRepository } from '../repository/user.repository';
import { LoginUserDto } from '../dto/request/login-user.dto';
import { RefreshTokenRepository } from '@app/auth/repository/refresh-token.repository';
import { UpdateUserDto } from '../dto/request/update-user.dto';

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
    private readonly refreshTokenRepository: RefreshTokenRepository,
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

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ result: UserResponseDto; refreshToken: string }> {
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
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const clear = UserMapper.toClearUserDto(user, accessToken);

    return UserMapper.toUserResponse(clear);
  }

  async refresh(oldToken: string) {
    if (!oldToken) {
      throw new BadRequestException('Refresh token required');
    }

    //! 관심사 분리 원칙으로 authService의 verifyRefreshToken 메서드로 리팩토링 필요 (시작점)
    const { sub: userId, jti }: { sub: string; jti?: string } =
      this.authService.verifyRefreshToken(oldToken);

    const record = await this.refreshTokenRepository.findById(jti);

    if (!record) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (record.revokedAt) {
      throw new UnauthorizedException('Refresh token revoked');
    }
    if (record.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const ok = await this.authService.compare(oldToken, record.tokenHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    //! 관심사 분리 원칙으로 authService의 verifyRefreshToken 메서드로 리팩토링 필요 (끝점)

    const { accessToken, refreshToken } =
      await this.authService.issueRefreshToken(userId);

    return { accessToken, refreshToken };
  }

  // ! 동일한 username, email인 경우 Throw Error & Image, bio는 사용자가 삭제할 수 있음.
  async updateUser(updateUserDto: UpdateUserDto, token: string) {
    const INVALID = new HttpException(
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED,
    );

    const { sub: userId } = this.authService.verifyAccessToken(token);
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    let passwordHashed: string | undefined = undefined;
    if (updateUserDto.password || updateUserDto.passwordOld) {
      const ok = await this.authService.compare(
        updateUserDto.passwordOld,
        user.password,
      );

      if (!ok) {
        throw INVALID;
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
}
