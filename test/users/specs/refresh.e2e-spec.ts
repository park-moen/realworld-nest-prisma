import { PrismaService } from '@app/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  cleanupE2ETest,
  resetDatabase,
  setupE2ETest,
} from '@test/helpers/e2e-test-setup.helper';
import {
  countUserRefreshTokens,
  createUserInDB,
  extractRefreshTokenFromCookie,
  loginUser,
} from '@test/helpers/user-test.helper';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';

describe('Feature: Refresh Token 갱신 (Refresh E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let config: ConfigService;
  let jwt: JwtService;
  let refreshCookieName: string;

  beforeAll(async () => {
    const context = await setupE2ETest();
    app = context.app;
    prisma = context.prisma;
    config = context.config;
    jwt = context.jwt;

    // ConfigService로 쿠키 이름 가져오기
    refreshCookieName = config.get<string>(
      'REFRESH_COOKIE_NAME',
      'refresh_token',
    );
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await cleanupE2ETest({ app, prisma });
  });

  describe('Scenario: 유효한 RT 갱신', () => {
    describe('Given 유효한 Refresh Token을 가진 경우', () => {
      let validRefreshToken: string;
      let userId: string;

      beforeEach(async () => {
        // Given: 사용자 생성 및 로그인
        const user = await createUserInDB(prisma, {
          email: 'refresh@example.com',
          username: 'refresh-user',
          password: 'password1234',
        });
        userId = user.id;

        const { refreshToken } = await loginUser(
          app,
          {
            email: 'refresh@example.com',
            password: 'password1234',
          },
          refreshCookieName,
        );

        validRefreshToken = refreshToken;
      });

      it('When Refresh Token으로 갱신하면, Then 200 상태코드와 새로운 Access Token을 반환한다.', async () => {
        // When
        const response = await request(app.getHttpServer())
          .post('/users/refresh')
          .set('Cookie', `${refreshCookieName}=${validRefreshToken}`);

        // Then
        expect(response.status).toBe(200);
        expect(response.body.user).toHaveProperty('token');
        expect(typeof response.body.user.token).toBe('string');
        expect(response.body.user.token.length).toBeGreaterThan(0);
      });

      // ! 실제 구현에서 RT를 재발급하지 않는 문제를 fix 브랜치에서 해결해야 한다.
      it('When Refresh Token으로 갱신하면, Then 새로운 Refresh Token이 Cookie로 반환된다.', async () => {
        // When
        const response = await request(app.getHttpServer())
          .post('/users/refresh')
          .set('Cookie', `${refreshCookieName}=${validRefreshToken}`);

        // Then
        const cookies = response.headers['set-cookie'];
        expect(cookies).toBeDefined();

        const newRefreshToken = extractRefreshTokenFromCookie(
          cookies,
          refreshCookieName,
        );
        expect(newRefreshToken).not.toBe(validRefreshToken);
        expect(newRefreshToken).toBeDefined();
        expect(newRefreshToken.length).toBeGreaterThan(0);
      });

      it('When Refresh Token으로 갱신하면, Then 쿠키에 보안 옵션이 설정된다.', async () => {
        // When
        const response = await request(app.getHttpServer())
          .post('/users/refresh')
          .set('Cookie', `${refreshCookieName}=${validRefreshToken}`);

        // Then
        const setCookieHeader = response.headers['set-cookie'];
        expect(setCookieHeader).toBeDefined();
        console.log('setCookieHeader', setCookieHeader);

        const cookieString = (
          Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader
        ) as string;

        // 보안 옵션 검증
        expect(cookieString).toContain('HttpOnly');

        const sameSite = config.get<string>('REFRESH_COOKIE_SAMESITE', 'lax');
        expect(cookieString.toLowerCase()).toContain(
          `samesite=${sameSite.toLowerCase()}`,
        );
      });

      // ! 실제 구현에서 RT를 재발급하지 않는 문제를 fix 브랜치에서 해결해야 한다.
      it('When Refresh Token이 갱신하면, Then 새로운 Refresh Token 발급으로 DB의 레코드 개수가 1 증가한다.', async () => {
        // Given
        const beforeCount = await countUserRefreshTokens(prisma, userId);

        // When
        await request(app.getHttpServer())
          .post('/users/refresh')
          .set('Cookie', `${refreshCookieName}=${validRefreshToken}`);

        // Then
        const afterCount = await countUserRefreshTokens(prisma, userId);
        expect(afterCount).toBe(beforeCount + 1);
      });
    });

    describe('Given Refresh Token이 제공되지 않은 경우', () => {
      it('When 쿠키 없이 갱신 요청을 하면, Then 400 에러를 반환한다', async () => {
        // When
        const response = await request(app.getHttpServer()).post(
          '/users/refresh',
        );

        // Then
        expect(response.status).toBe(400);
      });
    });

    describe('Given 유효하지 않은 Refresh Token인 경우', () => {
      it('When 잘못된 형식의 토큰으로 요청하면, Then 401 에러를 반환한다', async () => {
        // When
        const response = await request(app.getHttpServer())
          .post('/users/refresh')
          .set('Cookie', `${refreshCookieName}=invalid.token.format`);

        // Then
        expect(response.status).toBe(401);
      });
    });

    describe('Given 만료된 Refresh Token인 경우', () => {
      let expiredRefreshToken: string;

      beforeEach(async () => {
        // Given: 사용자 생성
        const user = await createUserInDB(prisma, {
          email: 'expired@example.com',
          username: 'expired-user',
          password: 'password123',
        });

        expiredRefreshToken = jwt.sign(
          {
            sub: user.id,
            jti: 'test-jti',
          },
          {
            secret: config.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: '-1s', // 만료를 위한 과거 시간 (-1초)
          },
        );

        // DB에도 만료된 토큰 저장 (해시)
        const tokenHash = await bcrypt.hash(expiredRefreshToken, 10);
        await prisma.refreshToken.create({
          data: {
            id: 'test-jti',
            userId: user.id,
            tokenHash,
            expiresAt: new Date(Date.now() - 1000), // 1초 전 만료,
          },
        });

        console.log('expiredRefreshToken', expiredRefreshToken);
      });

      it('When 만료된 Refresh Token으로 갱신하면, Then 401 에러를 반환한다', async () => {
        // When
        const response = await request(app.getHttpServer())
          .post('/users/refresh')
          .set('Cookie', `${refreshCookieName}=${expiredRefreshToken}`);

        const cookies = response.headers['set-cookie'];
        console.log('cookies', cookies);

        console.log('response.body', response.body);

        // Then
        expect(response.status).toBe(401);
        expect(response.body.message).toContain('expired');
      });
    });
  });
});
