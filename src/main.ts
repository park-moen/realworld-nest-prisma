import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  // Todo(Refactor): Custom Logger로 만들기 & 설정 추가하기
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger(),
  });
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(3000);
}
bootstrap();
