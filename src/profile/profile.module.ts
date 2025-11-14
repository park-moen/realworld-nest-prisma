import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { AuthModule } from '@app/auth/auth.module';
import { ProfileService } from './profile.service';
import { UserModule } from '@app/user/user.module';
import { FollowModule } from '@app/follow/follow.module';

@Module({
  imports: [AuthModule, UserModule, FollowModule],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
