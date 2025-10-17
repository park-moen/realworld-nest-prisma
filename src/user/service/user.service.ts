import { AuthService } from '@app/auth/auth.service';
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
import { randomUUID } from 'crypto';

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

    const jti = randomUUID();
    const accessToken = this.authService.signAccessToken(user.id);
    const refreshToken = this.authService.signRefreshToken(user.id, jti);
    const tokenHash = await this.authService.hash(refreshToken);

    await this.refreshTokenRepository.save({
      id: jti,
      tokenHash,
      user: { connect: { id: user.id } },
      expiresAt: this.authService.computeExpiryDate(),
    });

    const clear = UserMapper.toClearUserDto(user, accessToken);

    return {
      result: UserMapper.toUserResponse(clear),
      refreshToken: refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token required');
    }

    let payload: { sub: string; jti?: string };

    try {
      payload = this.authService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const record = await this.refreshTokenRepository.findById(payload.jti);

    if (!record) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (record.revokedAt) {
      throw new UnauthorizedException('Refresh token revoked');
    }
    if (record.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const ok = await this.authService.compare(refreshToken, record.tokenHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = this.authService.signAccessToken(record.userId);

    return { accessToken, refreshToken };
  }
}
