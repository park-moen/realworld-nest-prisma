import { AuthUser } from '@app/common/types/auth-user';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
