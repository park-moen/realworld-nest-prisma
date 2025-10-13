import { randomUUID } from 'crypto';
import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from '@app/auth/auth.service';
import { UserService } from './user.service';
import { UserRepository } from '../repository/user.repository';

describe('UserService', () => {
  let service: UserService;
  const repository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const auth = {
    hashPassword: jest.fn(),
    comparePassword: jest.fn(),
    generateJWT: jest.fn(),
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
    expect(auth.hashPassword).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('존재하지 않으면 비밀번호를 해싱하고 사용자 생성한다', async () => {
    repository.findByEmail.mockResolvedValue(null);
    auth.hashPassword.mockResolvedValue('bcrypt-hash');

    const userId = randomUUID();
    repository.create.mockResolvedValue({
      id: userId,
      email: 'b@b.com',
      username: 'mj',
      password: 'bcrypt-hash',
    });
    auth.generateJWT.mockReturnValue('mocked.jwt.token');

    const createUserDto = {
      email: 'b@b.com',
      password: 'pw',
      username: 'mj',
    };
    const created = await service.createUser(createUserDto as any);

    expect(repository.findByEmail).toHaveBeenCalledWith('b@b.com');
    expect(auth.hashPassword).toHaveBeenCalledWith('pw');
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
    expect(auth.comparePassword).not.toHaveBeenCalled();
    expect(auth.generateJWT).not.toHaveBeenCalled();
  });

  it('비밀번호가 일치하지 않으면 UNAUTHORIZED 예외를 던진다.', async () => {
    const stored = {
      id: randomUUID(),
      email: 'mj@ex.com',
      username: 'mj',
      password: 'stored-bcrypt-hash',
    };

    repository.findByEmail.mockResolvedValue(stored);
    auth.comparePassword.mockResolvedValue(false);

    await expect(
      service.login({ email: 'mj@ex.com', password: 'wrong' } as any),
    ).rejects.toEqual(
      new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED),
    );

    expect(repository.findByEmail).toHaveBeenCalledWith('mj@ex.com');
    expect(auth.comparePassword).toHaveBeenCalledWith(
      'wrong',
      'stored-bcrypt-hash',
    );
    expect(auth.generateJWT).not.toHaveBeenCalled();
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
    auth.comparePassword.mockResolvedValue(true);
    auth.generateJWT.mockReturnValue('mocked.jwt.token');

    const response = await service.login({
      email: 'mj@ex.com',
      password: 'pw',
    } as any);

    expect(repository.findByEmail).toHaveBeenCalledWith('mj@ex.com');
    expect(auth.comparePassword).toHaveBeenCalledWith(
      'pw',
      'stored-bcrypt-hash',
    );
    expect(auth.generateJWT).toHaveBeenCalledWith(
      expect.objectContaining({
        id: stored.id,
        email: 'mj@ex.com',
        username: 'mj',
      }),
    );

    expect(response.user.email).toBe('mj@ex.com');
    expect(response.user.username).toBe('mj');
    expect(response.user.token).toBe('mocked.jwt.token');
    expect(response.user.bio).toBeNull();
    expect(response.user.image).toBeNull();
  });
});
