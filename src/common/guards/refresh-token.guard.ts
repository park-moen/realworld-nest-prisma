import { RefreshTokenRepository } from '@app/auth/repository/refresh-token.repository';
import { AuthService } from '@app/auth/service/auth.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const cookieName = this.authService.getRefreshCookieName();
    const token: string | undefined = req.cookies?.[cookieName];

    if (!token) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    try {
      const payload = this.authService.verifyRefreshToken(token);

      const { sub: userId, jti } = payload;
      if (!userId || !jti) {
        throw new UnauthorizedException('Invalid refresh token payload');
      }

      const record = await this.refreshTokenRepository.findById(jti);
      if (!record) {
        throw new UnauthorizedException('Refresh token not found');
      }
      if (record.revokedAt) {
        throw new UnauthorizedException('Refresh token revoked');
      }
      if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      const ok = await this.authService.compare(token, record.tokenHash);
      if (!ok) {
        throw new UnauthorizedException('Refresh token hash mismatch');
      }

      req.user = { userId, jti, refreshToken: token };
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Refresh token expired');
      }
      if (error instanceof NotBeforeError) {
        throw new UnauthorizedException('Refresh token not active yet');
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Malformed refresh token');
      }
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Refresh token verification failed');
    }
  }
}
