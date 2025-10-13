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
});
