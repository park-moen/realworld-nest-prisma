import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/prisma/prisma.module';
import { UserModule } from '@app/user/user.module';
import { AuthModule } from './auth/auth.module';
import { FeatureFlagModule } from './core/feature-flag/feature-flag.module';
import { APP_GUARD } from '@nestjs/core';
import { FeatureFlagGuard } from './common/guards/feature-flag.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
