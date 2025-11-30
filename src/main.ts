import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ConsoleLogger } from '@nestjs/common';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  // Todo(Refactor): Custom Logger로 만들기 & 설정 추가하기
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger(),
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(cookieParser());

  // 🔥 CORS 설정 (프로덕션 + 로컬 허용)
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:5173',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Origin이 없는 경우 (서버 간 요청)
      if (!origin) {
        return callback(null, true);
      }

      // 디버깅용 로그
      console.log('🔍 Received Origin:', origin);
      console.log('✅ Configured Origins:', allowedOrigins);

      // 정확한 매칭 확인
      if (allowedOrigins.includes(origin)) {
        console.log('✅ Exact match - allowed');
        return callback(null, true);
      }

      // 와일드카드 패턴 매칭
      const isAllowed = allowedOrigins.some((allowedOrigin) => {
        // 와일드카드가 포함된 경우 regex로 변환
        if (allowedOrigin.includes('*')) {
          // https://*.vercel.app -> ^https://.*\.vercel\.app$
          const regexPattern = allowedOrigin
            .replace(/\./g, '\\.') // . → \.
            .replace(/\*/g, '[^.]+'); // * → [^.]+ (서브도메인 매칭)

          const regex = new RegExp(`^${regexPattern}$`);
          const isMatch = regex.test(origin);

          if (isMatch) {
            console.log(`✅ Wildcard match - Pattern: ${regexPattern}`);
          }

          return isMatch;
        }
        return false;
      });

      if (isAllowed) {
        return callback(null, true);
      }

      // CORS 차단
      console.warn(`❌ CORS blocked - Origin not allowed: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on port ${port}`);
}
bootstrap();
