import { ExecutionContext, Injectable } from '@nestjs/common';
import { AccessTokenGuard } from './access-token.guard';
import { AuthService } from '@app/auth/auth.service';

@Injectable()
export class OptionalAccessTokenGuard extends AccessTokenGuard {
  constructor(authService: AuthService) {
    super(authService);
  }
  canActivate(context: ExecutionContext): boolean {
    try {
      return super.canActivate(context);
    } catch {
      const req = context.switchToHttp().getRequest();
      req.user = undefined;
      return true;
    }
  }
}
