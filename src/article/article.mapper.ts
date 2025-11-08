import { Article } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ArticleResponseDto } from './dto/response/article.response.dto';
import { ClearAuthorDto } from './dto/response/author.response.dto';

export class ArticleMapper {
  static toSingleArticleResponse(
    article: Article & {
      author?: ClearAuthorDto;
    },
  ): ArticleResponseDto {
    return plainToInstance(
      ArticleResponseDto,
      { article },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  static toArticlesResponse(
    articles: (Article & { author?: ClearAuthorDto })[],
  ): ArticleResponseDto[] {
    return articles.map((article) => this.toSingleArticleResponse(article));
  }
}
