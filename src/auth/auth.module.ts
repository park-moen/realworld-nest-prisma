import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenRepository } from './repository/refresh-token.repository';
import { PrismaModule } from '@app/prisma/prisma.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.accessSecret'),
        signOptions: { expiresIn: config.get<string>('jwt.accessExpiresIn') },
      }),
    }),
    PrismaModule,
  ],
  providers: [AuthService, RefreshTokenRepository],
  exports: [AuthService, RefreshTokenRepository],
})
export class AuthModule {}
