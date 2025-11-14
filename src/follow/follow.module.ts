import { PrismaModule } from '@app/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowRepository } from './follow.repository';

@Module({
  imports: [PrismaModule],
  providers: [FollowService, FollowRepository],
  exports: [FollowService],
})
export class FollowModule {}
