import { plainToInstance } from 'class-transformer';
import {
  CommentDto,
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
}
