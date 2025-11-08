import { User } from '@prisma/client';

export interface UpdatePayload {
  username?: string;
  email?: string;
  password?: string;
  image?: string | null;
  bio?: string | null;
}

export interface UserResult {
  user: User;
  accessToken: string;
}

export interface LoginResult extends UserResult {
  refreshToken: string;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}
