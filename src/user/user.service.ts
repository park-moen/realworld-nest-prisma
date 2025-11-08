import { AuthService } from '@app/auth/auth.service';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UserRepository } from './user.repository';
import { LoginUserDto } from './dto/request/login-user.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import {
  EmailAlreadyExistsError,
  EmailMismatchError,
  PasswordMismatchError,
  UsernameAlreadyExistsError,
  UserNotFoundError,
} from '@app/common/errors/user-domain.error';
import {
  LoginResult,
  RefreshResult,
  UpdatePayload,
  UserResult,
} from './user.type';

@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResult> {
    const { email, username, password } = createUserDto;

    const userExists = await this.userRepository.findByEmailOrUsername(
      email,
      username,
    );

    if (userExists) {
      if (userExists.email === email) {
        throw new EmailAlreadyExistsError(email);
      }

      if (userExists.username === username) {
        throw new UsernameAlreadyExistsError(username);
      }
    }

    const passwordHashed = await this.authService.hash(password);

    const user = await this.userRepository.create({
      ...createUserDto,
      password: passwordHashed,
    });
    const token = this.authService.signAccessToken(user.id);

    return {
      user,
      accessToken: token,
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginResult> {
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

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async getUserCurrent(
    userId: string | undefined,
    accessToken: string | undefined,
  ): Promise<UserResult> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    return { user, accessToken };
  }

  // ! 동일한 username, email인 경우 Throw Error & Image, bio는 사용자가 삭제할 수 있음.
  async updateUser(
    updateUserDto: UpdateUserDto,
    token: string,
  ): Promise<UserResult> {
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

    return {
      user: updateUser,
      accessToken: token,
    };
  }

  async refresh(oldToken: string): Promise<RefreshResult> {
    return this.authService.rotateRefresh(oldToken);
  }
}
