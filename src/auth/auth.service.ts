import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

type JwtPayload = { sub: string; jti?: string };

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
  ) {
    this.round = Number(config.get('BCRYPT_ROUNDS') ?? 12);

    this.accessSecret = this.config.get<string>('JWT_ACCESS_SECRET', 'access');
    this.accessExpires = this.config.get<string>('JWT_ACCESS_EXPIRES', '15m');

    this.refreshSecret = this.config.get<string>(
      'JWT_REFRESH_SECRET',
      'refresh',
    );
    this.refreshExpires = this.config.get<string>('JWT_REFRESH_EXPIRES', '7d');

    this.cookieName = this.config.get<string>(
      'REFRESH_COOKIE_NAME',
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

  verifyRefreshToken(refresh: string) {
    try {
      const options: JwtVerifyOptions = { secret: this.refreshSecret };
      const verifyToken = this.jwtService.verify<JwtPayload>(refresh, options);

      if (!verifyToken?.sub || !verifyToken?.jti) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return verifyToken;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
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
    const secure = this.config.get<boolean>('REFRESH_COOKIE_SECURE', false);
    const sameSite = this.config.get<string>(
      'REFRESH_COOKIE_SAMESITE',
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
