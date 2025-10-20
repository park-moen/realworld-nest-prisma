import { RefreshTokenRepository } from '@app/auth/repository/refresh-token.repository';

export type MockRefreshTokenRepository = {
  [K in keyof RefreshTokenRepository]: jest.MockedFunction<
    RefreshTokenRepository[K]
  >;
};

export const createMockRefreshTokenRepository =
  (): MockRefreshTokenRepository => ({
    findById: jest.fn(),
    save: jest.fn(),
    revoke: jest.fn(),
  });

// 성공 시나리오 프리셋
export const mockValidRefreshToken = (userId: string, jti: string) => ({
  id: jti,
  userId,
  tokenHash: 'stored-hash',
  expiresAt: new Date(Date.now() + 3600_000),
  revokedAt: null,
});
