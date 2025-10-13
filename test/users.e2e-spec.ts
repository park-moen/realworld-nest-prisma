import {
  INestApplication,
  ValidationPipe,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';

import { AppModule } from '@app/app.module';
import { PrismaService } from '@app/prisma/prisma.service';

describe('User SignUp E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const uniqueId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const makeEmail = () => `user_${uniqueId()}@e2e.dev`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    prisma = app.get(PrismaService);

    await app.init();
    await prisma.$transaction([prisma.user.deleteMany({})]);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('POST /users - 회원가입 성공 시 DB에 레코드를 추가하고 UserResponseDto 객체를 반환한다.', async () => {
    const email = makeEmail();
    const beforeUserCount = await prisma.user.count();

    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        user: {
          email,
          username: 'mj_e2e',
          password: 'password1234',
        },
      });

    // Response 검증: 응당 포멧 검증 + password 반환 X 확인
    expect(response.body).toHaveProperty('user');
    const user = response.body.user;
    expect(user).toMatchObject({
      email,
      username: 'mj_e2e',
      bio: null,
      image: null,
    });
    expect(user).not.toHaveProperty('password');
    expect(typeof user.token).toBe('string');

    // DB 검증: 개수 + password hash로 저장 확인
    const afterUserCount = await prisma.user.count();
    expect(afterUserCount).toBe(beforeUserCount + 1);

    const dbUser = await prisma.user.findUnique({ where: { email } });
    expect(dbUser).toBeTruthy();
    expect(dbUser!.password).not.toBe('password1234');
  });

  it('POST /users - 중복 이메일이면 400을 반환하고 DB 개수 번화가 없다.', async () => {
    const email = makeEmail();
    await prisma.user.create({
      data: {
        email,
        username: `mj_${uniqueId()}`,
        password: 'hashed_pw',
        bio: null,
        image: null,
      },
    });

    const beforeUserCount = await prisma.user.count();
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        user: {
          email,
          username: 'dup_mj',
          password: 'password1234',
        },
      })
      .expect(400);

    expect(response.body?.message ?? response.text).toContain(
      'User already exists',
    );

    const afterUserCount = await prisma.user.count();
    expect(afterUserCount).toBe(beforeUserCount);
  });

  it('POST /users - Response body가 규약을 어기면 400을 반환한다. (validation)', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({
        user: {
          email: 'not-an-email',
          username: '',
          password: '12',
        },
      })
      .expect(400);
  });
});

describe('User Login E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: ClassSerializerInterceptor,
          useFactory: (reflector: Reflector) =>
            new ClassSerializerInterceptor(reflector),
          inject: [Reflector],
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // 테스트 격리를 위해 유저 테이블 비우기
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /users/login - 이메일/비밀번호가 일치하면 200을 반환하고 토큰을 포함한다.', async () => {
    const password = 'supersecret';
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email: 'mj@ex.com',
        username: 'mj',
        password: hash,
        bio: null,
        image: null,
      },
    });

    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({ user: { email: 'mj@ex.com', password } });

    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe('mj@ex.com');
    expect(response.body.user.username).toBe('mj');
    expect(response.body.user).toHaveProperty('token');
    expect(response.body.user.bio).toBeNull();
    expect(response.body.user.image).toBeNull();
  });

  it('POST /users/login - 가입되지 않은 이메일이면 401을 반환한다.', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({ user: { email: 'no@user.com', password: 'whatever123' } });

    expect(response.status).toBe(401);
  });

  it('POST /users/login - 비밀번호가 일치하지 않으면 401을 반환한다.', async () => {
    const hash = await bcrypt.hash('right-password', 10);
    await prisma.user.create({
      data: { email: 'mj@ex.com', username: 'mj', password: hash },
    });

    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({ user: { email: 'mj@ex.com', password: 'wrong-password' } });

    expect(response.status).toBe(401);
  });

  it('POST /users/login - Request body가 규약을 어기면 400을 반환한다. (validation)', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({ user: { email: '', password: '' } });

    expect(response.status).toBe(400);
    expect(
      Array.isArray(response.body.message) ||
        typeof response.body.message === 'string',
    ).toBe(true);
  });
});
