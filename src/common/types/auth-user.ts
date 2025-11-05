export type AuthUser = {
  userId: string;
  jti?: string;
  refreshToken?: string;
};

export type JwtPayload = { sub: string; jti?: string };
