import { randomUUID } from 'crypto';
import {
  AuthServiceTestContext,
  setupAuthServiceTest,
} from '../factories/auth-service-test.factory';

const signRefreshTokenTest = () => {
  describe('AuthService', () => {
    describe('signRefreshToken', () => {
      let context: AuthServiceTestContext;

      beforeAll(async () => {
        context = await setupAuthServiceTest();
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      describe('Scenario: 유효한 사용자 ID와 JTI로 Refresh Token을 생성', () => {});

      describe('Given 유효한 사용자 ID와 JTI가 주어진 경우', () => {
        const userId = randomUUID();
        const jti = randomUUID();
        const refreshToken = 'mocked.refresh.token';

        beforeEach(() => {
          context.jwtService.sign.mockReturnValue(refreshToken);
        });

        it('When signRefreshToken을 호출하면, Then Refresh Token을 반환한다.', () => {
          // When
          const result = context.service.signRefreshToken(userId, jti);

          // Then
          expect(typeof result).toBe('string');
          expect(result).toBe(refreshToken);
        });

        it('When signRefreshToken을 호출하면 Then payload에 sub(userId)와 jti가 모두 포함된다.', () => {
          // When
          context.service.signRefreshToken(userId, jti);

          // Then
          expect(context.jwtService.sign).toHaveBeenCalledWith(
            { sub: userId, jti },
            expect.any(Object),
          );
        });
      });
    });
  });
};

export default signRefreshTokenTest;
