import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleRepository } from './article.repository';
import { ArticleController } from './article.controller';
import { PrismaModule } from '@app/prisma/prisma.module';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ArticleService, ArticleRepository],
  controllers: [ArticleController],
})
export class ArticleModule {}
