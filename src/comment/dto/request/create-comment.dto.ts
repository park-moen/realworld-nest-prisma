import { Trim } from '@app/common/transforms/trim.transform';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  body: string;
}
