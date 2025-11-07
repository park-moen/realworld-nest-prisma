import { AuthService } from '@app/auth/auth.service';

export type MockAuthService = {
  [K in keyof AuthService]: jest.MockedFunction<AuthService[K]>;
};

export const createMockAuthService = (): MockAuthService =>
  ({
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    issueRefreshToken: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn(),
    computeExpiryDate: jest.fn(),
    buildRefreshCookieOptions: jest.fn(),
    getRefreshCookieName: jest.fn(),
  }) as any;

// 성공 시나리오 프리셋
export const mockAuthServiceWithValidTokens = (): Partial<MockAuthService> => ({
  signAccessToken: jest.fn().mockReturnValue('mocked.access.token'),
  signRefreshToken: jest.fn().mockReturnValue('mocked.refresh.token'),
  hash: jest.fn().mockResolvedValue('hashed-value'),
  compare: jest.fn().mockResolvedValue(true),
});
