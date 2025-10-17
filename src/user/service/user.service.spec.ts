import { AuthService } from '@app/auth/auth.service';
import { UserRepository } from '../repository/user.repository';
import { UserService } from './user.service';
import { RefreshTokenRepository } from '@app/auth/repository/refresh-token.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let authService: jest.Mocked<AuthService>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;

  // 공통 Mock 팩토리 함수
  const createMockUserRepository = () => ({
    findByEmail: jest.fn(),
    create: jest.fn(),
  });

  const createMockAuthService = () => ({
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn(),
    computeExpiryDate: jest.fn(),
  });

  const createMockRefreshTokenRepository = () => ({
    findById: jest.fn(),
    save: jest.fn(),
    revoke: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: createMockUserRepository() },
        { provide: AuthService, useValue: createMockAuthService() },
        {
          provide: RefreshTokenRepository,
          useValue: createMockRefreshTokenRepository(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
    authService = module.get(AuthService);
    refreshTokenRepository = module.get(RefreshTokenRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    describe('Given 이미 존재하는 이멜일인 경우', () => {
      const existingUser = { id: randomUUID(), email: 'existing@example.com' };
      const createUserDto = {
        email: 'existing@example.com',
        password: 'password1234',
        username: 'test-user',
      };

      beforeEach(() => {
        userRepository.findByEmail.mockResolvedValue(existingUser as any);
      });

      it('When 사용자 생성을 시도하면, Then BAD_REQUEST 예외를 던진다.', async () => {
        // When
        const createUserPromise = service.createUser(createUserDto);

        // Then
        await expect(createUserPromise).rejects.toEqual(
          new HttpException('User already exists', HttpStatus.BAD_REQUEST),
        );
        expect(userRepository.findByEmail).toHaveBeenCalledWith(
          createUserDto.email,
        );
        expect(authService.hash).not.toHaveBeenCalled();
        expect(userRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('Given 신규 사용자인 경우', () => {
      const newUserId = randomUUID();
      const createUserDto = {
        email: 'newUser@example.com',
        password: 'password1234',
        username: 'new-user',
      };
      const hashedPassword = 'bcrypt-hashed-password';
      const accessToken = 'mocked.access.token';

      beforeEach(() => {
        userRepository.findByEmail.mockResolvedValue(null);
        authService.hash.mockResolvedValue(hashedPassword);
        userRepository.create.mockResolvedValue({
          id: newUserId,
          email: createUserDto.email,
          password: createUserDto.password,
          username: createUserDto.username,
        } as any);
        authService.signAccessToken.mockReturnValue(accessToken);
      });

      it('When 사용자가 생성을 시도하면, Then 비밀번호를 해싱하고 사용자를 생성한다.', async () => {
        // When
        const result = await service.createUser(createUserDto);

        // Then
        expect(userRepository.findByEmail).toHaveBeenCalledWith(
          createUserDto.email,
        );
        expect(authService.hash).toHaveBeenCalledWith(createUserDto.password);
        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ password: hashedPassword }),
        );
        expect(result.user.email).toBe(createUserDto.email);
        expect(result.user.token).toBe(accessToken);
      });
    });
  });

  describe('login', () => {
    describe('Given 등록되지 않은 이메일인 경우', () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password1234',
      };

      beforeEach(() => {
        userRepository.findByEmail.mockResolvedValue(null);
      });

      it('When 로그인을 시도하면, Then UNAUTHORIZED 예외를 던진다.', async () => {
        // When
        const loginPromise = service.login(loginDto as any);

        // Then
        await expect(loginPromise).rejects.toEqual(
          new HttpException(
            'Invalid email or password',
            HttpStatus.UNAUTHORIZED,
          ),
        );
        expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
        expect(authService.compare).not.toHaveBeenCalled();
        expect(authService.signAccessToken).not.toHaveBeenCalled();
        expect(authService.signRefreshToken).not.toHaveBeenCalled();
        expect(refreshTokenRepository.save).not.toHaveBeenCalled();
      });
    });

    describe('Given 등록된 사용자지만 비밀번호가 일치하지 않는 경우', () => {
      const storedUser = {
        id: randomUUID(),
        email: 'user@example.com',
        username: 'test-user',
        password: 'stored-hashed-password',
      };
      const loginDto = {
        email: 'user@example.com',
        password: 'wrongPassword',
      };

      beforeEach(() => {
        userRepository.findByEmail.mockResolvedValue(storedUser as any);
        authService.compare.mockResolvedValue(false);
      });

      it('When 잘못된 비밀번호로 로그인을 시도하면, Then UNAUTHORIZED 예외를 던진다.', async () => {
        // When
        const loginPromise = service.login(loginDto as any);

        // Then
        await expect(loginPromise).rejects.toEqual(
          new HttpException(
            'Invalid email or password',
            HttpStatus.UNAUTHORIZED,
          ),
        );
        expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
        expect(authService.compare).toHaveBeenCalledWith(
          loginDto.password,
          storedUser.password,
        );
        expect(authService.signAccessToken).not.toHaveBeenCalled();
        expect(authService.signRefreshToken).not.toHaveBeenCalled();
        expect(refreshTokenRepository.save).not.toHaveBeenCalled();
      });
    });

    describe('Given 올바른 이메일과 비밀번호를 가진 경우', () => {
      const storedUser = {
        id: randomUUID(),
        email: 'user@example.com',
        username: 'test-user',
        password: 'stored-hashed-password',
        bio: null,
        image: null,
      };
      const loginDto = {
        email: 'user@example.com',
        password: 'correctPassword',
      };
      const accessToken = 'mocked.access.token';
      const refreshToken = 'mocked.refresh.token';
      const hashedRefreshToken = 'hashed.refresh.token';

      beforeEach(() => {
        userRepository.findByEmail.mockResolvedValue(storedUser as any);
        authService.compare.mockResolvedValue(true);
        authService.signAccessToken.mockReturnValue(accessToken);
        authService.signRefreshToken.mockReturnValue(refreshToken);
        authService.hash.mockResolvedValue(hashedRefreshToken);
        refreshTokenRepository.save.mockResolvedValue(undefined);
      });

      it('When 로그인을 시도하면, Then AT/RT를 발급한다.', async () => {
        // When
        const result = await service.login(loginDto as any);
        // Then
        expect(userRepository.findByEmail).toHaveBeenCalledWith(
          storedUser.email,
        );
        expect(authService.compare).toHaveBeenCalledWith(
          loginDto.password,
          storedUser.password,
        );
        expect(authService.signAccessToken).toHaveBeenCalledWith(storedUser.id);
        expect(authService.signRefreshToken).toHaveBeenCalledWith(
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
        await service.login(loginDto as any);

        // Then
        expect(authService.hash).toHaveBeenCalledWith(refreshToken);
        expect(refreshTokenRepository.save).toHaveBeenCalled();
        expect(refreshTokenRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            tokenHash: hashedRefreshToken,
            user: { connect: { id: storedUser.id } },
          }),
        );
      });
    });
  });

  describe('refresh', () => {
    const validRefreshToken = 'valid.refresh.token';
    const userId = 'user-id-123';
    const jti = 'jti-uuid-123';

    describe('Given RT가 제공되지 않은 경우', () => {
      it('When 토큰 갱신을 시도하면, Then BAD_REQUEST 예외를 던진다.', async () => {
        // When
        const refreshPromise = service.refresh(undefined as any);

        // Then
        expect(refreshPromise).rejects.toThrow(
          new BadRequestException('Refresh token required'),
        );
      });
    });

    describe('Given 서명이 유효하지 않은 RT인 경우', () => {
      beforeEach(() => {
        authService.verifyRefreshToken.mockImplementation(() => {
          throw new Error('Invalid signature');
        });
      });

      it('When 토큰 갱신을 시도하면, Then UNAUTHORIZED 예외를 던진다.', async () => {
        // When
        const refreshPromise = service.refresh(validRefreshToken);

        // Then
        await expect(refreshPromise).rejects.toThrow(
          new UnauthorizedException('Invalid refresh token'),
        );
      });
    });

    describe('Given DB에 존재하지 않는 RT인 경우', () => {
      beforeEach(() => {
        authService.verifyRefreshToken.mockReturnValue({
          sub: userId,
          jti: jti,
        });
        refreshTokenRepository.findById.mockResolvedValue(null);
      });

      it('When 토큰 갱신을 시도하면, Then UNAUTHORIZED 예외를 던진다.', async () => {
        // When
        const refreshPromise = service.refresh(validRefreshToken);

        // Then
        await expect(refreshPromise).rejects.toThrow(
          new UnauthorizedException('Invalid refresh token'),
        );
        expect(refreshTokenRepository.findById).toHaveBeenCalledWith(jti);
      });
    });

    describe('Given 이미 폐기(revoked)된 RT인 경우', () => {
      beforeEach(() => {
        authService.verifyRefreshToken.mockReturnValue({
          sub: userId,
          jti: jti,
        });
        refreshTokenRepository.findById.mockResolvedValue({
          id: jti,
          userId: userId,
          tokenHash: 'stored-hash',
          expiresAt: new Date(Date.now() + 3600_000),
          revokedAt: new Date(),
        } as any);
      });

      it('When 토큰 갱신을 시도하면, Then UNAUTHORIZED 예외를 던진다.', async () => {
        // When
        const refreshPromise = service.refresh(validRefreshToken);

        // Then
        await expect(refreshPromise).rejects.toThrow(
          new UnauthorizedException('Refresh token revoked'),
        );
      });
    });

    describe('Given 만료된 RT인 경우', () => {
      beforeEach(() => {
        authService.verifyRefreshToken.mockReturnValue({
          sub: userId,
          jti: jti,
        });
        refreshTokenRepository.findById.mockResolvedValue({
          id: jti,
          userId: userId,
          tokenHash: 'stored-hash',
          expiresAt: new Date(Date.now() - 1000),
          revokedAt: null,
        } as any);
      });

      it('When 토큰 갱신을 시도하면, Then UNAUTHORIZED 예외를 던진다.', async () => {
        // When
        const refreshPromise = service.refresh(validRefreshToken);

        // Then
        await expect(refreshPromise).rejects.toThrow(
          new UnauthorizedException('Refresh token expired'),
        );
      });
    });

    describe('Given 토큰 해시가 일치하지 않는 경우', () => {
      beforeEach(() => {
        authService.verifyRefreshToken.mockReturnValue({
          sub: userId,
          jti: jti,
        });
        refreshTokenRepository.findById.mockResolvedValue({
          id: jti,
          userId: userId,
          tokenHash: 'stored-hash',
          expiresAt: new Date(Date.now() + 3600_000),
          revokedAt: null,
        } as any);
        authService.compare.mockResolvedValue(false);
      });

      it('When 토큰 갱신을 시도하면, Then UNAUTHORIZED 예외를 던진다.', async () => {
        // When
        const refreshPromise = service.refresh(validRefreshToken);

        // Then
        await expect(refreshPromise).rejects.toThrow(
          new UnauthorizedException('Invalid refresh token'),
        );
        expect(authService.compare).toHaveBeenCalledWith(
          validRefreshToken,
          'stored-hash',
        );
      });
    });

    describe('Given 유효한 RT인 경우 ', () => {
      const newAccessToken = 'new.access.token';

      beforeEach(() => {
        authService.verifyRefreshToken.mockReturnValue({
          sub: userId,
          jti: jti,
        });
        refreshTokenRepository.findById.mockResolvedValue({
          id: jti,
          userId: userId,
          tokenHash: 'stored-hash',
          expiresAt: new Date(Date.now() + 3600_000),
          revokedAt: null,
        } as any);
        authService.compare.mockResolvedValue(true);
        authService.signAccessToken.mockReturnValue(newAccessToken);
      });

      it('When 토큰 갱신을 시도하면, Then 새로운 AT를 발급한다.', async () => {
        // When
        const result = await service.refresh(validRefreshToken);

        // Then
        expect(authService.verifyRefreshToken).toHaveBeenCalledWith(
          validRefreshToken,
        );
        expect(refreshTokenRepository.findById).toHaveBeenCalledWith(jti);
        expect(authService.compare).toHaveBeenCalledWith(
          validRefreshToken,
          'stored-hash',
        );
        expect(authService.signAccessToken).toHaveBeenCalledWith(userId);
        expect(result.accessToken).toBe(newAccessToken);
      });
    });
  });
});
