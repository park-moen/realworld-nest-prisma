import { plainToInstance } from 'class-transformer';
import {
  ArticleResponseDto,
  ClearArticleDto,
  MultipleArticleResponseDto,
} from './dto/response/article.response.dto';

// ! CommentMapper와 동일한 네이밍 규칙으로 변경해야함.
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

  static toMultiArticleResponse(
    articles: ClearArticleDto[],
    articlesCount: number,
  ): MultipleArticleResponseDto {
    return plainToInstance(
      MultipleArticleResponseDto,
      { articles, articlesCount },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
