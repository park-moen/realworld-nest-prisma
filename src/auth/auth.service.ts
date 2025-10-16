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
}
