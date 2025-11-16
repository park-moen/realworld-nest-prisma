import { ProfileDto } from '@app/profile/dto/response/profile.response.dto';
import { Expose, Type } from 'class-transformer';

export class CommentDto {
  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  body: string;

  @Expose()
  author: ProfileDto;
}

export class SingleCommentResponseDto {
  @Expose()
  @Type(() => CommentDto)
  comment: CommentDto;
}

export class MultipleCommentsResponseDto {
  @Expose()
  @Type(() => CommentDto)
  comments: CommentDto[];
}
