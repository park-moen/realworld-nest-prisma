import { randomUUID } from 'crypto';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '@app/auth/auth.service';
import { UserService } from './user.service';
import { UserRepository } from '../repository/user.repository';
import { RefreshTokenRepository } from '@app/auth/repository/refresh-token.repository';

describe('UserService.refresh', () => {
  let service: UserService;
  const auth = {
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn(),
  };
  const repository = {
    findById: jest.fn(),
    save: jest.fn(),
    revoke: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: RefreshTokenRepository,
          useValue: repository,
        },
        { provide: AuthService, useValue: auth },
        { provide: UserRepository, useValue: null },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  const RT = 'rt';
  const USER_ID = 'u-1';
  const JTI = 'jti-1';

  it('RT 미제공 -> 400', async () => {
    await expect(service.refresh(undefined as any)).rejects.toThrow(
      new BadRequestException('Refresh token required'),
    );
  });

  it('서명/검증 실패 -> 401', async () => {
    (auth.verifyRefreshToken as jest.Mock).mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(service.refresh(RT)).rejects.toThrow(
      new UnauthorizedException('Invalid refresh token'),
    );
  });

  it('DB 미존재 -> 401', async () => {
    (auth.verifyRefreshToken as jest.Mock).mockReturnValue({
      sub: USER_ID,
      jti: JTI,
    });
    repository.findById.mockResolvedValue(null);

    await expect(service.refresh(RT)).rejects.toThrow(
      new UnauthorizedException('Invalid refresh token'),
    );
  });

  it('revoked -> 401', async () => {
    (auth.verifyRefreshToken as jest.Mock).mockReturnValue({
      sub: USER_ID,
      jti: JTI,
    });
    repository.findById.mockResolvedValue({
      id: JTI,
      userId: USER_ID,
      tokenHash: 'h',
      expiresAt: new Date(Date.now() - 3600_000),
      revokedAt: new Date(),
    });

    await expect(service.refresh(RT)).rejects.toThrow(
      new UnauthorizedException('Refresh token revoked'),
    );
  });

  it('만료 -> 401', async () => {
    (auth.verifyRefreshToken as jest.Mock).mockReturnValue({
      sub: USER_ID,
      jti: JTI,
    });
    repository.findById.mockResolvedValue({
      id: JTI,
      userId: USER_ID,
      tokenHash: 'h',
      expiresAt: new Date(Date.now() - 1000),
      revokedAt: null,
    });

    await expect(service.refresh(RT)).rejects.toThrow(
      new UnauthorizedException('Refresh token expired'),
    );
  });

  it('hash 불일치 -> 401', async () => {
    (auth.verifyRefreshToken as jest.Mock).mockReturnValue({
      sub: USER_ID,
      jti: JTI,
    });
    repository.findById.mockResolvedValue({
      id: JTI,
      userId: USER_ID,
      tokenHash: 'stored-hash',
      expiresAt: new Date(Date.now() + 3600_000),
      revokedAt: null,
    });
    (auth.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.refresh(RT)).rejects.toThrow(
      new UnauthorizedException('Invalid refresh token'),
    );
  });

  it('성공 -> 새로운 Access Token 발급', async () => {
    (auth.verifyRefreshToken as jest.Mock).mockReturnValue({
      sub: USER_ID,
      jti: JTI,
    });
    repository.findById.mockResolvedValue({
      id: JTI,
      userId: USER_ID,
      tokenHash: 'stored',
      expiresAt: new Date(Date.now() + 3600_000),
      revokedAt: null,
    });
    (auth.compare as jest.Mock).mockResolvedValue(true);
    (auth.signAccessToken as jest.Mock).mockReturnValue('new.at');

    const response = await service.refresh(RT);

    expect(response).toEqual({ accessToken: 'new.at' });
  });
});

describe('UserService', () => {
  let service: UserService;
  const repository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const auth = {
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: repository },
        { provide: AuthService, useValue: auth },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('이미 존재하는 이메일이면 BAD_REQUEST 예외를 던진다.', async () => {
    repository.findByEmail.mockResolvedValue({ id: randomUUID() } as any);

    await expect(
      service.createUser({
        email: 'a@a.com',
        password: '1234',
        username: 'mj',
      } as any),
    ).rejects.toEqual(
      new HttpException('User already exists', HttpStatus.BAD_REQUEST),
    );
    expect(repository.findByEmail).toHaveBeenCalledWith('a@a.com');
    expect(auth.hash).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('존재하지 않으면 비밀번호를 해싱하고 사용자 생성한다', async () => {
    repository.findByEmail.mockResolvedValue(null);
    auth.hash.mockResolvedValue('bcrypt-hash');

    const userId = randomUUID();
    repository.create.mockResolvedValue({
      id: userId,
      email: 'b@b.com',
      username: 'mj',
      password: 'bcrypt-hash',
    });
    auth.signAccessToken.mockReturnValue('mocked.jwt.token');

    const createUserDto = {
      email: 'b@b.com',
      password: 'pw',
      username: 'mj',
    };
    const created = await service.createUser(createUserDto as any);

    expect(repository.findByEmail).toHaveBeenCalledWith('b@b.com');
    expect(auth.hash).toHaveBeenCalledWith('pw');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'bcrypt-hash' }),
    );
    expect(created.user.email).toBe('b@b.com');
    expect(created.user.token).toBe('mocked.jwt.token');
  });

  // UserService.login 메서드 관련 Test 코드
  it('가입되지 않은 이메일이면 UNAUTHORIZED 예외를 던진다.', async () => {
    repository.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'b@b.com', password: 'password1234' }),
    ).rejects.toEqual(
      new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED),
    );

    expect(repository.findByEmail).toHaveBeenCalledWith('b@b.com');
    expect(auth.compare).not.toHaveBeenCalled();
    expect(auth.signAccessToken).not.toHaveBeenCalled();
  });

  it('비밀번호가 일치하지 않으면 UNAUTHORIZED 예외를 던진다.', async () => {
    const stored = {
      id: randomUUID(),
      email: 'mj@ex.com',
      username: 'mj',
      password: 'stored-bcrypt-hash',
    };

    repository.findByEmail.mockResolvedValue(stored);
    auth.compare.mockResolvedValue(false);

    await expect(
      service.login({ email: 'mj@ex.com', password: 'wrong' } as any),
    ).rejects.toEqual(
      new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED),
    );

    expect(repository.findByEmail).toHaveBeenCalledWith('mj@ex.com');
    expect(auth.compare).toHaveBeenCalledWith('wrong', 'stored-bcrypt-hash');
    expect(auth.signAccessToken).not.toHaveBeenCalled();
  });

  it('이메일/비밀번호가 맞으면 JWT를 발급하고 UserRepositoryDto를 반환한다.', async () => {
    const stored = {
      id: randomUUID(),
      email: 'mj@ex.com',
      username: 'mj',
      password: 'stored-bcrypt-hash',
      bio: null,
      image: null,
    };

    repository.findByEmail.mockResolvedValue(stored);
    auth.compare.mockResolvedValue(true);
    auth.signAccessToken.mockReturnValue('mocked.jwt.token');

    const response = await service.login({
      email: 'mj@ex.com',
      password: 'pw',
    } as any);

    expect(repository.findByEmail).toHaveBeenCalledWith('mj@ex.com');
    expect(auth.compare).toHaveBeenCalledWith('pw', 'stored-bcrypt-hash');
    expect(auth.signAccessToken).toHaveBeenCalledWith(stored.id);

    expect(response.user.email).toBe('mj@ex.com');
    expect(response.user.username).toBe('mj');
    expect(response.user.token).toBe('mocked.jwt.token');
    expect(response.user.bio).toBeNull();
    expect(response.user.image).toBeNull();
  });
});
