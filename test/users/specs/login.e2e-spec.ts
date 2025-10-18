import { PrismaService } from '@app/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import {
  cleanupE2ETest,
  resetDatabase,
  setupE2ETest,
} from '@test/helpers/e2e-test-setup.helper';
import {
  createUserInDB,
  getUserRefreshTokens,
} from '@test/helpers/user-test.helper';
import * as request from 'supertest';

describe('Feature: 로그인 (Login E2E)', () => {
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

  describe('Scenario: 등록된 사용자 로그인', () => {
    describe('Given 등록된 사용자가 존재하는 경우', () => {
      const userCredentials = {
        email: 'test-user@example.com',
        username: 'test-user',
        password: 'super-secret',
      };

      beforeEach(async () => {
        await createUserInDB(prisma, userCredentials);
      });

      it('When 올바른 정보로 로그인하면, Then 200 상태코그와 사용자 정보를 반환한다.', async () => {
        // When
        const response = await request(app.getHttpServer())
          .post('/users/login')
          .send({
            user: {
              email: userCredentials.email,
              password: userCredentials.password,
            },
          });

        // Then
        expect(response.status).toBe(200);
        expect(response.body.user).toMatchObject({
          email: userCredentials.email,
          username: userCredentials.username,
          bio: null,
          image: null,
        });
      });

      it('When 올바른 정보로 로그인하면, Then AT가 발급된다.', async () => {
        // When
        const response = await request(app.getHttpServer())
          .post('/users/login')
          .send({
            user: {
              email: userCredentials.email,
              password: userCredentials.password,
            },
          });

        // Then
        expect(response.body.user).toHaveProperty('token');
      });

      it('When 올바른 정보로 로그인하면, Then RT가 cookie에 저장된다.', async () => {
        const response = await request(app.getHttpServer())
          .post('/users/login')
          .send({
            user: {
              email: userCredentials.email,
              password: userCredentials.password,
            },
          });
        const refreshToken = response.headers['set-cookie'];
        expect(refreshToken).toBeDefined();
      });

      it('When 올바른 정보로 로그인하면, Then RT가 DB에 저장된다.', async () => {
        // When
        await request(app.getHttpServer())
          .post('/users/login')
          .send({
            user: {
              email: userCredentials.email,
              password: userCredentials.password,
            },
          });

        // Then
        const user = await prisma.user.findUnique({
          where: { email: userCredentials.email },
        });
        const refreshToken = await getUserRefreshTokens(prisma, user!.id);
        expect(refreshToken.length).toBeGreaterThan(0);
      });
    });

    describe('Given 등록되지 않은 이메일인 경우', () => {
      it('When 로그인을 시도하면, Then 401 에러를 반환한다.', async () => {
        // When
        const response = await request(app.getHttpServer())
          .post('/users/login')
          .send({
            user: {
              email: 'nonexistent@example.com',
              password: 'whatever123',
            },
          });

        // Then
        expect(response.status).toBe(401);
      });
    });

    describe('Given 잘못된 비밀번호인 경우', () => {
      beforeEach(async () => {
        await createUserInDB(prisma, {
          email: 'user@example.com',
          username: 'user',
          password: 'correct-password',
        });
      });

      it('When 잘못된 비밀번호로 로그인하면, Then 401 에러를 반환한다.', async () => {
        // When
        const response = await request(app.getHttpServer())
          .post('/users/login')
          .send({
            user: {
              email: 'user@example.com',
              password: 'wrong-password',
            },
          });

        // Then
        expect(response.status).toBe(401);
      });
    });

    describe('Given 잘못된 요청 형식인 경우', () => {
      it('When 빈 이메일과 비밀번호로 요청하면, Then 400 에러를 반환한다.', async () => {
        // When
        const response = await request(app.getHttpServer())
          .post('/users/login')
          .send({
            user: {
              email: '',
              password: '',
            },
          });

        // Then
        expect(response.status).toBe(400);
      });
    });
  });
});
