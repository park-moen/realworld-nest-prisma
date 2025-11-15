import { PrismaModule } from '@app/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { CommentController } from './comment.controller';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository],
  exports: [CommentService],
})
export class CommentModule {}
