import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '@app/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '@app/auth/auth.module';
import { UserRepository } from './user.repository';
import { IsImageStorageUrlConstraint } from '../common/validators/is-image-storage-url.constraint';

@Module({
  imports: [
    PrismaModule,
    //! 불필요한 의존성 주입, 새로운 브랜치 생성해서 제거
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_ACCESS_EXPIRES') },
      }),
    }),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, IsImageStorageUrlConstraint],
  exports: [IsImageStorageUrlConstraint],
})
export class UserModule {}
