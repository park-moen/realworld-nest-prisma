import { PrismaModule } from '@app/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { CommentController } from './comment.controller';
import { AuthModule } from '@app/auth/auth.module';
import { ArticleModule } from '@app/article/article.module';

@Module({
  imports: [PrismaModule, AuthModule, ArticleModule],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository],
})
export class CommentModule {}
