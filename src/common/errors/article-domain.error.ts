import { HttpStatus } from '@nestjs/common';
import { DomainError } from './base-domain.error';

enum ArticleErrorCode {
  SLUG_ALREADY_EXISTS = 'ARTICLE.SLUG_ALREADY_EXISTS',
}

export class SlugAlreadyExistsError extends DomainError {
  constructor(slug: string) {
    super(
      ArticleErrorCode.SLUG_ALREADY_EXISTS,
      'Article slug already exists',
      HttpStatus.CONFLICT,
      { slug },
    );
  }
}
