import { Trim } from '@app/common/transforms/trim.transform';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// ! 빈 문자열이 들어오지 못하게 검증
export class CreateArticleDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  body: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagList?: string[];
}
