export type AuthUser = {
  userId: string;
  jti?: string;
  refreshToken?: string;
  token?: string;
};

export type JwtPayload = { sub: string; jti?: string };
