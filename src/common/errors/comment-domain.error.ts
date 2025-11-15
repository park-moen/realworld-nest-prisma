import { HttpStatus } from '@nestjs/common';
import { DomainError } from './base-domain.error';

enum CommentErrorCode {
  COMMENT_NOT_FOUND = 'COMMENT.COMMENT_NOT_FOUND',
}

// 존재하지 않는 댓글 삭제 시도
export class CommentNotFoundError extends DomainError {
  constructor() {
    super(
      CommentErrorCode.COMMENT_NOT_FOUND,
      'Comment not found',
      HttpStatus.NOT_FOUND,
    );
  }
}
