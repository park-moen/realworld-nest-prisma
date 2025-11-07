import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import {
  TokenExpiredError as JwtTokenExpiredError,
  JsonWebTokenError,
  NotBeforeError,
} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { RefreshTokenRepository } from '../repository/refresh-token.repository';
import { JwtPayload } from '@app/common/types/auth-user';
import {
  TokenExpiredError,
  TokenInvalidError,
} from '@app/common/errors/auth-domain.error';

@Injectable()
export class AuthService {
  private readonly round: number;

  private readonly accessSecret: string;
  private readonly accessExpires: string;

  private readonly refreshSecret: string;
  private readonly refreshExpires: string;

  private readonly cookieName: string;

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {
    this.round = Number(config.get('hasher.round') ?? 12);

    this.accessSecret = this.config.get<string>('jwt.accessSecret', 'access');
    this.accessExpires = this.config.get<string>('jwt.accessExpiresIn', '15m');

    this.refreshSecret = this.config.get<string>(
      'jwt.refreshSecret',
      'refresh',
    );
    this.refreshExpires = this.config.get<string>('jwt.refreshExpiresIn', '7d');

    this.cookieName = this.config.get<string>(
      'cookie.refreshCookieName',
      'refresh_token',
    );
  }

  signAccessToken(userId: string) {
    const payload: JwtPayload = { sub: userId };

    return this.jwtService.sign(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpires,
    });
  }

  signRefreshToken(userId: string, jti: string) {
    const payload: JwtPayload = { sub: userId, jti };

    return this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpires,
    });
  }

  async issueRefreshToken(userId: string) {
    const jti = randomUUID();
    const accessToken = this.signAccessToken(userId);
    const refreshToken = this.signRefreshToken(userId, jti);
    const tokenHash = await this.hash(refreshToken);

    await this.refreshTokenRepository.save({
      id: jti,
      tokenHash,
      user: { connect: { id: userId } },
      expiresAt: this.computeExpiryDate(),
    });

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string | undefined) {
    const secret = this.config.get<string>('jwt.accessSecret', 'access');
    const payload = this.jwtService.verify(token, { secret }) as {
      sub?: string;
    };

    if (!payload?.sub) {
      throw new TokenInvalidError('access');
    }

    return payload;
  }

  verifyRefreshToken(refresh: string) {
    let verifyToken: JwtPayload;
    try {
      const options: JwtVerifyOptions = { secret: this.refreshSecret };
      verifyToken = this.jwtService.verify<JwtPayload>(refresh, options);
    } catch (error) {
      if (error instanceof JwtTokenExpiredError) {
        throw new TokenExpiredError('refresh');
      }

      if (error instanceof NotBeforeError) {
        throw new TokenInvalidError('refresh');
      }

      if (error instanceof JsonWebTokenError) {
        throw new TokenInvalidError('refresh');
      }

      throw new TokenInvalidError('refresh');
    }

    if (!verifyToken?.sub || !verifyToken?.jti) {
      throw new TokenInvalidError('refresh');
    }

    return verifyToken;
  }

  async hash(value: string): Promise<string> {
    return await bcrypt.hash(value, this.round);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(plain, hashed);
  }

  computeExpiryDate(): Date {
    const m = this.refreshExpires.match(/^(\d+)([smhd])$/i);
    if (!m) {
      // fallback: 분 단위 문자열이 아닌 경우 7일
      return new Date(Date.now() + 7 * 24 * 3600 * 1000);
    }
    const amount = Number(m[1]);
    const unit = m[2].toLowerCase();

    const ms =
      unit === 's'
        ? amount * 1000
        : unit === 'm'
          ? amount * 60 * 1000
          : unit === 'h'
            ? amount * 60 * 60 * 1000
            : /* 'd' */ amount * 24 * 60 * 60 * 1000;

    return new Date(Date.now() + ms);
  }

  buildRefreshCookieOptions() {
    // ! this로 configService 환경변수 추출해야함
    const secure = this.config.get<boolean>(
      'cookie.refreshCookieSecret',
      false,
    );
    const sameSite = this.config.get<string>(
      'cookie.refreshCookieSameSite',
      'lax',
    ) as 'lax' | 'strict' | 'none';

    return {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
    } as const;
  }

  getRefreshCookieName() {
    return this.cookieName;
  }
}
