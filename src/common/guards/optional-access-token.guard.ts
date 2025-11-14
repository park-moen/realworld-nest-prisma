import { ExecutionContext, Injectable } from '@nestjs/common';
import { AccessTokenGuard } from './access-token.guard';

@Injectable()
export class OptionalAccessTokenGuard extends AccessTokenGuard {
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
