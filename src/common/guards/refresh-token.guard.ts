import { AuthService } from '@app/auth/service/auth.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const cookieName = this.authService.getRefreshCookieName();
    const token: string | undefined = req.cookies?.[cookieName];

    if (!token) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const payload = this.authService.verifyRefreshToken(token);

    const { sub: userId, jti } = payload;
    if (!userId || !jti) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    req.user = { userId, jti, refreshToken: token };
    return true;
  }
}
