import { AppModule } from '@app/app.module';
import { PrismaService } from '@app/prisma/prisma.service';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';

export interface E2ETestContext {
  app: INestApplication;
  prisma: PrismaService;
  config?: ConfigService;
  jwt?: JwtService;
}

export const setupE2ETest = async (): Promise<E2ETestContext> => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  const configService = app.get(ConfigService);
  const cookieSecret = configService.get<string>(
    'REFRESH_COOKIE_SECRET',
    'default-secret',
  );

  app.use(cookieParser(cookieSecret));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const prisma = app.get(PrismaService);
  const jwt = app.get(JwtService);
  await app.init();

  return { app, prisma, config: configService, jwt };
};

export const cleanupE2ETest = async (
  context: E2ETestContext,
): Promise<void> => {
  await context.app.close();
  await context.prisma.$disconnect();
};

export const resetDatabase = async (prisma: PrismaService): Promise<void> => {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;',
  );
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "RefreshToken" RESTART IDENTITY CASCADE;',
  );
};
