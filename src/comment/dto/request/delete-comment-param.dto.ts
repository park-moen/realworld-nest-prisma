import { SlugParamDto } from '@app/common/dto/request/slug-param.dto';
import { IsUUID } from 'class-validator';

export class deleteCommentParamDto extends SlugParamDto {
  @IsUUID()
  id: string;
}
