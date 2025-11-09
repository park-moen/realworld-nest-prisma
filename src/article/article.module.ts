import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleRepository } from './article.repository';
import { ArticleController } from './article.controller';
import { PrismaModule } from '@app/prisma/prisma.module';
import { AuthModule } from '@app/auth/auth.module';
import { TagModule } from '@app/tag/tag.module';
import { ArticleTransaction } from './article.transaction';
import { ArticleToTagModule } from '@app/articleToTag/articleToTag.module';

@Module({
  imports: [PrismaModule, AuthModule, TagModule, ArticleToTagModule],
  providers: [ArticleService, ArticleRepository, ArticleTransaction],
  controllers: [ArticleController],
})
export class ArticleModule {}
