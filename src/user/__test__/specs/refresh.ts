// import { BadRequestException, UnauthorizedException } from '@nestjs/common';
// import {
//   setupUserServiceTest,
//   UserServiceTestContext,
// } from '../helpers/user-test.helper';
// import { mockValidRefreshToken } from '../mocks/refresh-token-repository.mock';

// const refreshTest = () => {
//   describe('UserService', () => {
//     describe('refresh', () => {
//       let context: UserServiceTestContext;
//       const validRefreshToken = 'valid.refresh.token';
//       const userId = 'user-id-123';
//       const jti = 'jti-uuid-123';

//       beforeEach(async () => {
//         context = await setupUserServiceTest();
//       });

//       afterEach(() => {
//         jest.clearAllMocks();
//       });

//       describe('Given RT가 제공되지 않은 경우', () => {
//         it('When 토큰 갱신을 시도하면, Then BAD_REQUEST 예외를 던진다.', async () => {
//           // When
//           const refreshPromise = context.service.refresh(undefined as any);

//           // Then
//           expect(refreshPromise).rejects.toThrow(
//             new BadRequestException('Refresh token required'),
//           );
//         });
//       });

//       describe('Given 서명이 유효하지 않은 RT인 경우', () => {
//         beforeEach(() => {
//           context.authService.verifyRefreshToken.mockImplementation(() => {
//             throw new Error('Invalid refresh token');
//           });
//         });

//         it('When 토큰 갱신을 시도하면, Then UNAUTHORIZED 예외를 던진다.', async () => {
//           // When
//           const refreshPromise = context.service.refresh(validRefreshToken);

//           // Then
//           await expect(refreshPromise).rejects.toThrow(
//             new UnauthorizedException('Invalid refresh token'),
//           );
//         });
//       });

//       describe('Given DB에 존재하지 않는 RT인 경우', () => {
//         beforeEach(() => {
//           context.authService.verifyRefreshToken.mockReturnValue({
//             sub: userId,
//             jti: jti,
//           });
//           context.refreshTokenRepository.findById.mockResolvedValue(null);
//         });

//         it('When 토큰 갱신을 시도하면, Then UNAUTHORIZED 예외를 던진다.', async () => {
//           // When
//           const refreshPromise = context.service.refresh(validRefreshToken);

//           // Then
//           await expect(refreshPromise).rejects.toThrow(
//             new UnauthorizedException('Invalid refresh token'),
//           );
//           expect(context.refreshTokenRepository.findById).toHaveBeenCalledWith(
//             jti,
//           );
//         });
//       });

//       describe('Given 이미 폐기(revoked)된 RT인 경우', () => {
//         beforeEach(() => {
//           context.authService.verifyRefreshToken.mockReturnValue({
//             sub: userId,
//             jti: jti,
//           });
//           context.refreshTokenRepository.findById.mockResolvedValue({
//             id: jti,
//             userId: userId,
//             tokenHash: 'stored-hash',
//             expiresAt: new Date(Date.now() + 3600_000),
//             revokedAt: new Date(),
//           } as any);
//         });

//         it('When 토큰 갱신을 시도하면, Then UNAUTHORIZED 예외를 던진다.', async () => {
//           // When
//           const refreshPromise = context.service.refresh(validRefreshToken);

//           // Then
//           await expect(refreshPromise).rejects.toThrow(
//             new UnauthorizedException('Refresh token revoked'),
//           );
//         });
//       });

//       describe('Given 만료된 RT인 경우', () => {
//         beforeEach(() => {
//           context.authService.verifyRefreshToken.mockReturnValue({
//             sub: userId,
//             jti: jti,
//           });
//           context.refreshTokenRepository.findById.mockResolvedValue({
//             id: jti,
//             userId: userId,
//             tokenHash: 'stored-hash',
//             expiresAt: new Date(Date.now() - 1000),
//             revokedAt: null,
//           } as any);
//         });

//         it('When 토큰 갱신을 시도하면, Then UNAUTHORIZED 예외를 던진다.', async () => {
//           // When
//           const refreshPromise = context.service.refresh(validRefreshToken);

//           // Then
//           await expect(refreshPromise).rejects.toThrow(
//             new UnauthorizedException('Refresh token expired'),
//           );
//         });
//       });

//       describe('Given 토큰 해시가 일치하지 않는 경우', () => {
//         beforeEach(() => {
//           context.authService.verifyRefreshToken.mockReturnValue({
//             sub: userId,
//             jti: jti,
//           });
//           context.refreshTokenRepository.findById.mockResolvedValue({
//             id: jti,
//             userId: userId,
//             tokenHash: 'stored-hash',
//             expiresAt: new Date(Date.now() + 3600_000),
//             revokedAt: null,
//           } as any);
//           context.authService.compare.mockResolvedValue(false);
//         });

//         it('When 토큰 갱신을 시도하면, Then UNAUTHORIZED 예외를 던진다.', async () => {
//           // When
//           const refreshPromise = context.service.refresh(validRefreshToken);

//           // Then
//           await expect(refreshPromise).rejects.toThrow(
//             new UnauthorizedException('Invalid refresh token'),
//           );
//           expect(context.authService.compare).toHaveBeenCalledWith(
//             validRefreshToken,
//             'stored-hash',
//           );
//         });
//       });

//       describe('Given 유효한 RT인 경우 ', () => {
//         const validToken = 'valid-refresh-token';

//         beforeEach(() => {
//           context.authService.verifyRefreshToken.mockReturnValue({
//             sub: userId,
//             jti: jti,
//           });
//           context.refreshTokenRepository.findById.mockResolvedValue(
//             mockValidRefreshToken(userId, jti) as any,
//           );
//           context.authService.compare.mockResolvedValue(true);
//           context.authService.issueRefreshToken.mockResolvedValue({
//             accessToken: 'new-access-token',
//             refreshToken: 'new-refresh-token',
//           });
//         });

//         it('When 토큰 갱신을 시도하면, Then 새로운 AT를 발급한다.', async () => {
//           // When
//           const result = await context.service.refresh(validToken);

//           // Then
//           expect(context.authService.verifyRefreshToken).toHaveBeenCalledWith(
//             validToken,
//           );
//           expect(context.refreshTokenRepository.findById).toHaveBeenCalledWith(
//             jti,
//           );
//           expect(context.authService.compare).toHaveBeenCalledWith(
//             validToken,
//             'stored-hash',
//           );
//           expect(result.accessToken).toBe('new-access-token');
//           expect(result.refreshToken).toBe('new-refresh-token');
//           expect(context.authService.issueRefreshToken).toHaveBeenCalledWith(
//             userId,
//           );
//         });
//       });
//     });
//   });
// };

// export default refreshTest;
