import { plainToInstance } from 'class-transformer';
import { ArticleResponseDto } from './dto/response/article.response.dto';
import { ArticleWithTagNamesType } from './article.type';

export class ArticleMapper {
  static toSingleArticleResponse(
    article: ArticleWithTagNamesType,
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
    articles: ArticleWithTagNamesType[],
  ): ArticleResponseDto[] {
    return articles.map((article) => this.toSingleArticleResponse(article));
  }
}
