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

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    const authHeader = req.headers.authorization;
    if (
      !authHeader ||
      typeof authHeader !== 'string' ||
      !authHeader.startsWith('Bearer ')
    ) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.slice('Bearer '.length);

    try {
      const payload = this.authService.verifyAccessToken(token);
      req.user = { userId: payload.sub };

      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Access token expired');
      }
      if (error instanceof NotBeforeError) {
        throw new UnauthorizedException('Access token not active yet');
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Malformed access token');
      }
      throw new UnauthorizedException('Access token verification failed');
    }
  }
}
