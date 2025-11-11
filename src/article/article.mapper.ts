import { plainToInstance } from 'class-transformer';
import {
  ArticleResponseDto,
  ClearArticleDto,
} from './dto/response/article.response.dto';

export class ArticleMapper {
  static toSingleArticleResponse(article: ClearArticleDto): ArticleResponseDto {
    return plainToInstance(
      ArticleResponseDto,
      { article },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  static toArticlesResponse(articles: ClearArticleDto[]): ArticleResponseDto[] {
    return articles.map((article) => this.toSingleArticleResponse(article));
  }
}
