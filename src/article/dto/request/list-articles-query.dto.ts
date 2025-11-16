import { IsOptional } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class ListArticlesQueryDto extends PaginationQueryDto {
  @IsOptional()
  tag?: string;

  @IsOptional()
  author?: string;

  @IsOptional()
  favorited?: string;
}
