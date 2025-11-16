import { Trim } from '@app/common/transforms/trim.transform';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  body: string;
}
