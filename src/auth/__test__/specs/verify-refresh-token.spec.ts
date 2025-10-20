// specs/verify-refresh-token.spec.ts
import {
  setupAuthServiceTest,
  AuthServiceTestContext,
} from '../factories/auth-service-test.factory';
import { UnauthorizedException } from '@nestjs/common';
import {
  TokenExpiredError,
  JsonWebTokenError,
  NotBeforeError,
} from '@nestjs/jwt';

const verifyRefreshTokenTest = () => {
  describe('AuthService', () => {
    describe('verifyRefreshToken', () => {
      let context: AuthServiceTestContext;

      beforeEach(async () => {
        context = await setupAuthServiceTest();
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      describe('Given 유효한 Refresh Token이 주어진 경우', () => {
        const validToken = 'valid.refresh.token';
        const mockPayload = {
          sub: 'user-123',
          jti: 'jti-456',
        };

        beforeEach(() => {
          context.jwtService.verify.mockReturnValue(mockPayload);
        });

        it('When verifyRefreshToken을 호출하면, Then payload를 반환한다', () => {
          // When
          const result = context.service.verifyRefreshToken(validToken);

          // Then
          expect(result).toEqual(mockPayload);
        });

        it('When verifyRefreshToken을 호출하면, Then payload에 sub가 포함된다', () => {
          // When
          const result = context.service.verifyRefreshToken(validToken);

          // Then
          expect(result).toHaveProperty('sub', 'user-123');
        });

        it('When verifyRefreshToken을 호출하면, Then payload에 jti가 포함된다', () => {
          // When
          const result = context.service.verifyRefreshToken(validToken);

          // Then
          expect(result).toHaveProperty('jti', 'jti-456');
        });
      });

      describe('Given 만료된 Refresh Token이 주어진 경우', () => {
        const expiredToken = 'expired.refresh.token';

        beforeEach(() => {
          context.jwtService.verify.mockImplementation(() => {
            throw new TokenExpiredError('jwt expired', new Date());
          });
        });

        it('When verifyRefreshToken을 호출하면, Then "Refresh token expired" 에러를 던진다', () => {
          // When & Then
          expect(() =>
            context.service.verifyRefreshToken(expiredToken),
          ).toThrow(UnauthorizedException);
          expect(() =>
            context.service.verifyRefreshToken(expiredToken),
          ).toThrow('Refresh token expired');
        });
      });

      describe('Given 잘못된 형식의 Refresh Token이 주어진 경우', () => {
        const invalidToken = 'invalid.refresh.token';

        beforeEach(() => {
          context.jwtService.verify.mockImplementation(() => {
            throw new JsonWebTokenError('invalid token');
          });
        });

        it('When verifyRefreshToken을 호출하면, Then "Invalid refresh token" 에러를 던진다', () => {
          // When & Then
          expect(() =>
            context.service.verifyRefreshToken(invalidToken),
          ).toThrow(UnauthorizedException);
          expect(() =>
            context.service.verifyRefreshToken(invalidToken),
          ).toThrow('Invalid refresh token');
        });
      });

      describe('Given sub가 없는 Refresh Token이 주어진 경우', () => {
        const tokenWithoutSub = 'token.without.sub';

        beforeEach(() => {
          context.jwtService.verify.mockReturnValue({
            jti: 'jti-456',
          });
        });

        it('When verifyRefreshToken을 호출하면, Then "Invalid refresh token" 에러를 던진다', () => {
          // When & Then
          expect(() =>
            context.service.verifyRefreshToken(tokenWithoutSub),
          ).toThrow(UnauthorizedException);
          expect(() =>
            context.service.verifyRefreshToken(tokenWithoutSub),
          ).toThrow('Invalid refresh token');
        });
      });

      describe('Given jti가 없는 Refresh Token이 주어진 경우', () => {
        const tokenWithoutJti = 'token.without.jti';

        beforeEach(() => {
          context.jwtService.verify.mockReturnValue({
            sub: 'user-123',
          });
        });

        it('When verifyRefreshToken을 호출하면, Then "Invalid refresh token" 에러를 던진다', () => {
          // When & Then
          expect(() =>
            context.service.verifyRefreshToken(tokenWithoutJti),
          ).toThrow(UnauthorizedException);
          expect(() =>
            context.service.verifyRefreshToken(tokenWithoutJti),
          ).toThrow('Invalid refresh token');
        });
      });

      describe('Given 아직 유효하지 않은 Refresh Token이 주어진 경우', () => {
        const notYetValidToken = 'not.yet.valid.token';

        beforeEach(() => {
          context.jwtService.verify.mockImplementation(() => {
            throw new NotBeforeError('jwt not active', new Date());
          });
        });

        it('When verifyRefreshToken을 호출하면, Then "Token not yet valid" 에러를 던진다', () => {
          // When & Then
          expect(() =>
            context.service.verifyRefreshToken(notYetValidToken),
          ).toThrow(UnauthorizedException);
          expect(() =>
            context.service.verifyRefreshToken(notYetValidToken),
          ).toThrow('Token not yet valid');
        });
      });

      describe('Given 알 수 없는 에러가 발생하는 경우', () => {
        const problematicToken = 'problematic.token';

        beforeEach(() => {
          context.jwtService.verify.mockImplementation(() => {
            throw new Error('Unknown error');
          });
        });

        it('When verifyRefreshToken을 호출하면, Then "Token verification failed" 에러를 던진다', () => {
          // When & Then
          expect(() =>
            context.service.verifyRefreshToken(problematicToken),
          ).toThrow(UnauthorizedException);
          expect(() =>
            context.service.verifyRefreshToken(problematicToken),
          ).toThrow('Token verification failed');
        });
      });
    });
  });
};

export default verifyRefreshTokenTest;
