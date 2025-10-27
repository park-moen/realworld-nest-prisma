import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/prisma/prisma.module';
import { UserModule } from '@app/user/user.module';
import { AuthModule } from './auth/auth.module';
import { FeatureFlagModule } from './core/feature-flag/feature-flag.module';
import { APP_GUARD } from '@nestjs/core';
import { FeatureFlagGuard } from './common/guards/feature-flag.guard';
import configuration from './config/configuration';

// ! Config 중앙 집중화에서 리펙토링
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 Loading env file:', `.env.${process.env.NODE_ENV || 'local'}`);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
      load: [configuration],
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    FeatureFlagModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FeatureFlagGuard,
    },
  ],
})
export class AppModule {}
