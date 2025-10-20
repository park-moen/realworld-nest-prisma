import { randomUUID } from 'crypto';
import {
  AuthServiceTestContext,
  setupAuthServiceTest,
} from '../factories/auth-service-test.factory';

const issueRefreshTokenTest = () => {
  describe('AuthService', () => {
    describe('issueRefreshToken', () => {
      let context: AuthServiceTestContext;

      beforeEach(async () => {
        context = await setupAuthServiceTest();
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      describe('Given 유효한 사용자 ID가 주어진 경우', () => {
        const userId = randomUUID();
        const accessToken = 'mocked.access.token';
        const refreshToken = 'mocked.refresh.token';
        const mockHashedToken = 'hashed.refresh.token';
        const mockExpiryDate = new Date('2025-12-31');

        beforeEach(() => {
          context.jwtService.sign
            .mockReturnValueOnce(accessToken)
            .mockReturnValueOnce(refreshToken);
          context.bcrypt.hash.mockResolvedValue(mockHashedToken as never);
          context.refreshTokenRepository.save.mockResolvedValue(undefined);
          jest
            .spyOn(context.service, 'computeExpiryDate')
            .mockReturnValue(mockExpiryDate);
        });

        it('When issueRefreshToken을 호출하면, Then Access Token과 Refresh Token을 반환한다.', async () => {
          // When
          const result = await context.service.issueRefreshToken(userId);

          // Then
          expect(result).toHaveProperty('accessToken');
          expect(result).toHaveProperty('refreshToken');
          expect(result.accessToken).toBe(accessToken);
          expect(result.refreshToken).toBe(refreshToken);
        });

        it('When issueRefreshToken을 호출하면, Then Refresh Token을 해싱하여 DB에 저장한다.', async () => {
          // When
          await context.service.issueRefreshToken(userId);

          // Then
          expect(context.refreshTokenRepository.save).toHaveBeenCalledTimes(1);
          expect(context.refreshTokenRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
              tokenHash: mockHashedToken,
            }),
          );
        });

        it('When issueRefreshToken을 호출하면, Then 생성된 JTI가 DB에 저장된다.', async () => {
          // When
          await context.service.issueRefreshToken(userId);

          // Then
          const saveCall = context.refreshTokenRepository.save.mock.calls[0][0];
          expect(saveCall.id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          );
        });

        it('When issueRefreshToken을 호출하면, Then 계산된 만료 시간이 DB에 저장된다.', async () => {
          // When
          await context.service.issueRefreshToken(userId);

          // Then
          expect(context.refreshTokenRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
              expiresAt: mockExpiryDate,
            }),
          );
        });

        it('When issueRefreshToken을 호출하면, Then userId로 Refresh와 User DB를 연결한다.', async () => {
          // When
          await context.service.issueRefreshToken(userId);

          // Then
          expect(context.refreshTokenRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
              user: { connect: { id: userId } },
            }),
          );
        });
      });

      describe('Given Repository 저장이 실패하는 경우', () => {
        const userId = randomUUID();
        const ERROR_MESSAGE = 'Database connection failed';

        beforeEach(() => {
          context.jwtService.sign
            .mockReturnValueOnce('mocked.access.token')
            .mockReturnValueOnce('mocked.refresh.token');
          context.bcrypt.hash.mockResolvedValue('hashed-value' as never);
          context.refreshTokenRepository.save.mockRejectedValue(
            new Error(ERROR_MESSAGE),
          );
        });

        it('When issueRefreshToken을 호출하면, Then 에러를 던진다.', async () => {
          // When & Then
          await expect(
            context.service.issueRefreshToken(userId),
          ).rejects.toThrow(ERROR_MESSAGE);
        });
      });
    });
  });
};

export default issueRefreshTokenTest;
