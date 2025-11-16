import { plainToInstance } from 'class-transformer';
import {
  CommentDto,
  MultipleCommentsResponseDto,
  SingleCommentResponseDto,
} from './dto/response/comment.response.dto';

export class CommentMapper {
  static toResponseComment(comment: CommentDto): SingleCommentResponseDto {
    return plainToInstance(
      SingleCommentResponseDto,
      { comment },
      { excludeExtraneousValues: true },
    );
  }

  static toResponseMultipleComment(
    comments: CommentDto[],
  ): MultipleCommentsResponseDto {
    return plainToInstance(
      MultipleCommentsResponseDto,
      { comments },
      { excludeExtraneousValues: true },
    );
  }
}
