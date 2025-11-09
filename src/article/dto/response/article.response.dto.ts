import { Expose, Type } from 'class-transformer';
import { ClearAuthorDto } from './author.response.dto';

class ClearArticleDto {
  @Expose()
  slug: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  body: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => ClearAuthorDto)
  author: ClearAuthorDto;

  @Expose()
  tags?: string[];

  // @Expose()
  // favorited?: boolean;

  //   @Expose()
  //   favoritesCount?: number;
}

export class ArticleResponseDto {
  @Expose()
  @Type(() => ClearArticleDto)
  article: ClearArticleDto;
}
