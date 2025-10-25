import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/prisma/prisma.module';
import { UserModule } from '@app/user/user.module';
import { AuthModule } from './auth/auth.module';
import { FeatureFlagModule } from './core/feature-flag/feature-flag.module';

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
})
export class AppModule {}
