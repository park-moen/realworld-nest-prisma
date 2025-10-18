import { PrismaService } from '@app/prisma/prisma.service';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

export const uniqueId = () => randomUUID();

export const makeEmail = () => `user_${uniqueId()}@e2e.dev`;

export interface CreateUserFixture {
  email: string;
  username: string;
  password: string;
  passwordHash?: string;
}

export const createUserInDB = async (
  prisma: PrismaService,
  data: CreateUserFixture,
) => {
  const { email, username, password, passwordHash } = data;
  const passwordHashInDB = passwordHash ?? (await bcrypt.hash(password, 10));

  return prisma.user.create({
    data: {
      email,
      username,
      password: passwordHashInDB,
      bio: null,
      image: null,
    },
  });
};

// userId의 토큰 개수만 필요할 때 사용
export const countUserRefreshTokens = async (
  prisma: PrismaService,
  userId: string,
): Promise<number> => {
  return prisma.refreshToken.count({ where: { userId } });
};

// 토큰 내용을 검증해야 할 때만 사용
export const getUserRefreshTokens = async (
  prisma: PrismaService,
  userId: string,
) => {
  return prisma.refreshToken.findMany({
    where: { userId },
  });
};

// Cookie에서 Refresh Token 추출
export const extractRefreshTokenFromCookie = (
  cookies: string | string[] | undefined,
  cookieName: string,
): string => {
  if (!cookies) return '';

  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];

  for (const cookie of cookieArray) {
    const match = cookie.match(new RegExp(`${cookieName}=([^;]+)`));
    if (match) {
      return match[1];
    }
  }

  return '';
};

export const loginUser = async (
  app: INestApplication,
  credentials: { email: string; password: string },
  refreshCookieName: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  const response = await request(app.getHttpServer())
    .post('/users/login')
    .send({ user: credentials });

  const refreshToken = extractRefreshTokenFromCookie(
    response.headers['set-cookie'],
    refreshCookieName,
  );

  return {
    accessToken: response.body.user.token,
    refreshToken,
  };
};
