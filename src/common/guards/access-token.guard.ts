import { AuthService } from '@app/auth/service/auth.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Missing Authorization header');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    const token = authHeader.slice('Bearer '.length);
    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    const payload = this.authService.verifyAccessToken(token);

    req.user = { userId: payload.sub, token };
    return true;
  }
}
