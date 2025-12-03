import { Expose } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

export class TagListResponseDto {
  @Expose()
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
