import { PrismaModule } from '@app/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ArticleToTagRepository } from './articleToTag.repository';

@Module({
  imports: [PrismaModule],
  providers: [ArticleToTagRepository],
  exports: [ArticleToTagRepository],
})
export class ArticleToTagModule {}
