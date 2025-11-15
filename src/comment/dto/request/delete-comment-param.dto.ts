import { SlugParamDto } from '@app/article/dto/request/slug-param.dto';
import { IsUUID } from 'class-validator';

export class deleteCommentParamDto extends SlugParamDto {
  @IsUUID()
  id: string;
}
