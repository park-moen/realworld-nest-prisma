import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleRepository } from './article.repository';
import { ArticleController } from './article.controller';
import { PrismaModule } from '@app/prisma/prisma.module';
import { AuthModule } from '@app/auth/auth.module';
import { TagModule } from '@app/tag/tag.module';
import { ArticleTransaction } from './article.transaction';
import { ArticleToTagModule } from '@app/articleToTag/articleToTag.module';
import { FavoriteModule } from '@app/favorite/favorite.module';
import { UserModule } from '@app/user/user.module';
import { CommentModule } from '@app/comment/comment.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TagModule,
    ArticleToTagModule,
    FavoriteModule,
    UserModule,
    CommentModule,
  ],
  providers: [ArticleService, ArticleRepository, ArticleTransaction],
  controllers: [ArticleController],
})
export class ArticleModule {}
