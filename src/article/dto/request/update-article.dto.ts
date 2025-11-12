import { Trim } from '@app/common/transforms/trim.transform';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateArticleDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Body must not be empty' })
  body?: string;

  @Trim()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagList?: string[];
}
