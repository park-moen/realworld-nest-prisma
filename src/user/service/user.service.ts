import { AuthService } from '@app/auth/service/auth.service';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/request/create-user.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';
import { UserMapper } from '../user.mapper';
import { UserRepository } from '../repository/user.repository';
import { LoginUserDto } from '../dto/request/login-user.dto';
import { RefreshTokenRepository } from '@app/auth/repository/refresh-token.repository';
import { UpdateUserDto } from '../dto/request/update-user.dto';
import {
  EmailAlreadyExistsError,
  EmailMismatchError,
  PasswordMismatchError,
  RefreshTokenRevokedError,
  TokenExpiredError,
  TokenInvalidError,
  TokenNotFoundError,
  UserNotFoundError,
} from '@app/common/errors/domain.error';

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
    // ! UserRepository의 prisma에 의존하고 있어서 EmailAlreadyExistsError에서 Error를 잡지 않고
    // ! prisma 자체 Error를 반환한다. prisma가 직접 Error를 관리하는게 맞을까?
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
    // ! AccessToken Guard에서 token 유효성 검사를 진행함.
    // ! getUserCurrent에서는 user가 명확히 존재하지 않을까?
    // ! 이 에러 분기 if문은 어떤 에러를 잡는걸까?
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const clear = UserMapper.toClearUserDto(user, accessToken);

    return UserMapper.toUserResponse(clear);
  }

  async refresh(oldToken: string) {
    if (!oldToken) {
      //! Auth Service로 위임하는게 더 명확하지 않을까?
      throw new TokenNotFoundError('refresh');
    }

    //! 관심사 분리 원칙으로 authService의 verifyRefreshToken 메서드로 리팩토링 필요 (시작점)
    const { sub: userId, jti }: { sub: string; jti?: string } =
      this.authService.verifyRefreshToken(oldToken);

    const record = await this.refreshTokenRepository.findById(jti);

    if (!record) {
      throw new TokenInvalidError('refresh');
    }
    if (record.revokedAt) {
      throw new RefreshTokenRevokedError(jti);
    }
    if (record.expiresAt.getTime() <= Date.now()) {
      // ! @nestjs/jwt에서 제공하는 TokenExpiredError를 사용하는게 맞을까? 아니면 내가 만든 Domain Error를 사용하는게 맞을끼?
      throw new TokenExpiredError('refresh');
    }

    const ok = await this.authService.compare(oldToken, record.tokenHash);
    if (!ok) {
      // ! compare 관련 에러 코드는 AuthService에 위임하는게 맞지 않을까?
      throw new TokenInvalidError('refresh');
    }
    //! 관심사 분리 원칙으로 authService의 verifyRefreshToken 메서드로 리팩토링 필요 (끝점)

    const { accessToken, refreshToken } =
      await this.authService.issueRefreshToken(userId);

    return { accessToken, refreshToken };
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

      //! compare 관련 비지니스 로직 에러는 AuthService.compare로 위임하는게 맞지 않을까?
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
}
