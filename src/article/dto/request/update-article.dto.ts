import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateArticleDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Body must not be empty' })
  body?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagList?: string[];
}
