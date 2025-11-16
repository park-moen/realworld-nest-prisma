import { HttpStatus } from '@nestjs/common';
import { DomainError } from './base-domain.error';

enum CommentErrorCode {
  COMMENT_NOT_FOUND = 'COMMENT.COMMENT_NOT_FOUND',
  COMMENT_AUTHOR_MISMATCH = 'COMMENT.COMMENT_AUTHOR_MISMATCH',
}

// 존재하지 않는 댓글
export class CommentNotFoundError extends DomainError {
  constructor() {
    super(
      CommentErrorCode.COMMENT_NOT_FOUND,
      'Comment not found',
      HttpStatus.NOT_FOUND,
    );
  }
}

// 댓글 작성자가 아님
export class CommentAuthorMismatchError extends DomainError {
  constructor() {
    super(
      CommentErrorCode.COMMENT_AUTHOR_MISMATCH,
      'You are not the author of this comment',
      HttpStatus.FORBIDDEN,
    );
  }
}
