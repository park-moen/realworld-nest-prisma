import { randomUUID } from 'crypto';
import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '@app/prisma/prisma.service';
import { AuthService } from '@app/auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let auth: { hashPassword: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    auth = {
      hashPassword: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuthService, useValue: auth },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('이미 존재하는 이메일이면 BAD_REQUEST 예외를 던진다.', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: randomUUID(),
      email: 'a@a.com',
    });

    await expect(
      service.createUser({
        email: 'a@a.com',
        password: '1234',
        username: 'mj',
      } as any),
    ).rejects.toEqual(
      new HttpException('User already exists', HttpStatus.BAD_REQUEST),
    );

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'a@a.com' },
    });
    expect(auth.hashPassword).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('존재하지 않으면 비밀번호를 해싱하고 사용자 생성한다', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    auth.hashPassword.mockResolvedValue('bcrypt-hash');

    const userId = randomUUID();
    prisma.user.create.mockResolvedValue({
      id: userId,
      email: 'b@b.com',
      username: 'mj',
      passwordHash: 'bcrypt-hash',
    });

    const createUserDto = {
      email: 'b@b.com',
      password: 'pw',
      username: 'mj',
    };
    const created = await service.createUser(createUserDto as any);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'b@b.com' },
    });
    expect(auth.hashPassword).toHaveBeenCalledWith('pw');
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        ...createUserDto,
        passwordHash: 'bcrypt-hash',
      },
    });

    expect(typeof created.id).toBe('string');
    expect(created.id).toHaveLength(36);
  });
});
