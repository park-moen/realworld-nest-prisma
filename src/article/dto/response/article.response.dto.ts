import { Expose, Type } from 'class-transformer';
import { ClearAuthorDto } from './author.response.dto';

// ! profile.response.dto.ts처럼 명확하지 않은 ClearArticleDto 대신 ArticleDto로 네이밍 수정
export class ClearArticleDto {
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

  @Expose()
  favorited?: boolean;

  @Expose()
  favoritesCount?: number;
}

export class ArticleResponseDto {
  @Expose()
  @Type(() => ClearArticleDto)
  article: ClearArticleDto;
}
