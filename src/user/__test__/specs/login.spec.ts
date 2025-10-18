import { HttpException, HttpStatus } from '@nestjs/common';
import {
  createLoginDtoFixture,
  createUserFixture,
} from '../fixtures/user.fixture';
import {
  setupUserServiceTest,
  UserServiceTestContext,
} from '../helpers/user-test.helper';

describe('UserService', () => {
  describe('login', () => {
    let context: UserServiceTestContext;

    beforeEach(async () => {
      context = await setupUserServiceTest();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('login', () => {
      describe('Given 등록되지 않은 이메일인 경우', () => {
        const loginDto = createLoginDtoFixture({
          email: 'nonexistent@example.com',
        });

        beforeEach(() => {
          context.userRepository.findByEmail.mockResolvedValue(null);
        });

        it('When 로그인을 시도하면, Then UNAUTHORIZED 예외를 던진다.', async () => {
          // When
          const loginPromise = context.service.login(loginDto as any);

          // Then
          await expect(loginPromise).rejects.toEqual(
            new HttpException(
              'Invalid email or password',
              HttpStatus.UNAUTHORIZED,
            ),
          );
          expect(context.userRepository.findByEmail).toHaveBeenCalledWith(
            loginDto.email,
          );
          expect(context.authService.compare).not.toHaveBeenCalled();
          expect(context.authService.signAccessToken).not.toHaveBeenCalled();
          expect(context.authService.signRefreshToken).not.toHaveBeenCalled();
          expect(context.refreshTokenRepository.save).not.toHaveBeenCalled();
        });
      });

      describe('Given 등록된 사용자지만 비밀번호가 일치하지 않는 경우', () => {
        const storedUser = createUserFixture({
          email: 'user@example.com',
          password: 'stored-hashed-password',
        });
        const loginDto = createLoginDtoFixture({
          email: storedUser.email,
          password: 'wrongPassword',
        });

        beforeEach(() => {
          context.userRepository.findByEmail.mockResolvedValue(
            storedUser as any,
          );
          context.authService.compare.mockResolvedValue(false);
        });

        it('When 잘못된 비밀번호로 로그인을 시도하면, Then UNAUTHORIZED 예외를 던진다.', async () => {
          // When
          const loginPromise = context.service.login(loginDto as any);

          // Then
          await expect(loginPromise).rejects.toEqual(
            new HttpException(
              'Invalid email or password',
              HttpStatus.UNAUTHORIZED,
            ),
          );
          expect(context.userRepository.findByEmail).toHaveBeenCalledWith(
            loginDto.email,
          );
          expect(context.authService.compare).toHaveBeenCalledWith(
            loginDto.password,
            storedUser.password,
          );
          expect(context.authService.signAccessToken).not.toHaveBeenCalled();
          expect(context.authService.signRefreshToken).not.toHaveBeenCalled();
          expect(context.refreshTokenRepository.save).not.toHaveBeenCalled();
        });
      });

      describe('Given 올바른 이메일과 비밀번호를 가진 경우', () => {
        const storedUser = createUserFixture();
        const loginDto = createLoginDtoFixture({ email: storedUser.email });
        const accessToken = 'mocked.access.token';
        const refreshToken = 'mocked.refresh.token';
        const hashedRefreshToken = 'hashed.refresh.token';

        beforeEach(() => {
          context.userRepository.findByEmail.mockResolvedValue(
            storedUser as any,
          );
          context.authService.compare.mockResolvedValue(true);
          context.authService.signAccessToken.mockReturnValue(accessToken);
          context.authService.signRefreshToken.mockReturnValue(refreshToken);
          context.authService.hash.mockResolvedValue(hashedRefreshToken);
          context.refreshTokenRepository.save.mockResolvedValue(undefined);
        });

        it('When 로그인을 시도하면, Then AT/RT를 발급한다.', async () => {
          // When
          const result = await context.service.login(loginDto as any);

          // Then
          expect(context.userRepository.findByEmail).toHaveBeenCalledWith(
            storedUser.email,
          );
          expect(context.authService.compare).toHaveBeenCalledWith(
            loginDto.password,
            storedUser.password,
          );
          expect(context.authService.signAccessToken).toHaveBeenCalledWith(
            storedUser.id,
          );
          expect(context.authService.signRefreshToken).toHaveBeenCalledWith(
            storedUser.id,
            expect.any(String),
          );

          //! 모든 User 기능 구현 완료 후 리팩토링 과정에서 Mapper 수정 예정
          expect(result.result.user.email).toBe(storedUser.email);
          expect(result.result.user.username).toBe(storedUser.username);
          expect(result.result.user.token).toBe(accessToken);
          expect(result.refreshToken).toBe(refreshToken);
        });

        it('When 로그인을 시도하면, Then RT를 해싱하여 DB에 저장한다.', async () => {
          // When
          await context.service.login(loginDto as any);

          // Then
          expect(context.authService.hash).toHaveBeenCalledWith(refreshToken);
          expect(context.refreshTokenRepository.save).toHaveBeenCalled();
          expect(context.refreshTokenRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
              tokenHash: hashedRefreshToken,
              user: { connect: { id: storedUser.id } },
            }),
          );
        });

        it('When 로그인을 시도하면, Then RT에는 고유한 JTI가 포함된다.', async () => {
          // When
          await context.service.login(loginDto as any);

          // Then
          expect(context.refreshTokenRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
              id: expect.any(String),
            }),
          );
        });
      });
    });

    describe('Given 계정이 잠긴 경우', () => {
      // 추가 시나리오: 추후 계정 장금 기능 구현 시
    });

    describe('Given 비밀번호 만료가 필요한 경우', () => {
      // 추가 시나리오: 추후 비밀번호 만료 정책 구현 시
    });
  });
});
