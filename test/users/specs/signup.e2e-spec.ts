import { PrismaService } from '@app/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  cleanupE2ETest,
  resetDatabase,
  setupE2ETest,
} from '@test/helpers/e2e-test-setup.helper';
import { createUserInDB, makeEmail } from '@test/helpers/user-test.helper';

describe('Feature: 회원가입 (Signup E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const context = await setupE2ETest();
    app = context.app;
    prisma = context.prisma;
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await cleanupE2ETest({ app, prisma });
  });

  describe('scenario: 신규 사용자 회원가입', () => {
    describe('Given 신규 사용자 정보가 제공된 경우', () => {
      const newUserData = {
        email: '',
        username: 'new-user',
        password: 'password1234',
      };

      beforeEach(() => {
        newUserData.email = makeEmail();
      });

      it('When 회원가입 요청을 하면, Then 201 상태코그와 사용자 정보를 반환한.', async () => {
        // When
        const response = await request(app.getHttpServer())
          .post('/users')
          .send({ user: newUserData });

        // Then
        expect(response.status).toBe(201);
        expect(response.body.user).toMatchObject({
          email: newUserData.email,
          username: newUserData.username,
          bio: null,
          image: null,
        });
        expect(response.body.user).not.toHaveProperty('password');
        expect(typeof response.body.user.token).toBe('string');
      });

      it('When 회원가입 요청을 하면, Then DB에 암호화된 비밀번호로 저장된다.', async () => {
        // Given
        const beforeCount = await prisma.user.count();

        // When
        await request(app.getHttpServer())
          .post('/users')
          .send({ user: newUserData });

        // Then
        const afterCount = await prisma.user.count();
        expect(afterCount).toBe(beforeCount + 1);

        const dbUser = await prisma.user.findUnique({
          where: { email: newUserData.email },
        });
        expect(dbUser!.password).not.toBe(newUserData.password);
        expect(dbUser!.password).toMatch(/^\$2[aby]\$.+/);
      });
    });

    describe('Given 이미 등록된 이메일인 경우', () => {
      const existingEmail = makeEmail();

      beforeEach(async () => {
        await createUserInDB(prisma, {
          email: existingEmail,
          username: 'existing',
          password: 'password1234',
        });
      });

      it('When 동일한 이메일로 회원가입을 시도하면, Then 400 에러를 반환한다.', async () => {
        // Given
        const beforeCount = await prisma.user.count();

        // When
        const response = await request(app.getHttpServer())
          .post('/users')
          .send({
            user: {
              email: existingEmail,
              username: 'duplicate',
              password: 'password1234',
            },
          });

        // Then
        expect(response.status).toBe(400);
        const afterCount = await prisma.user.count();
        expect(afterCount).toBe(beforeCount);
      });
    });

    describe('Given 잘못된 형식의 요청인 경우', () => {
      it('When 유효하지 않은 이메일로 요청하면, Then 400 에러를 반환한다.', async () => {
        // When
        const response = await request(app.getHttpServer())
          .post('/users')
          .send({
            user: {
              email: 'not-an-email',
              username: '',
              password: '12',
            },
          });

        // Then
        expect(response.status).toBe(400);
      });
    });
  });
});
