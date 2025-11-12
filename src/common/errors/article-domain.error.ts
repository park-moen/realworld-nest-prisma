import { HttpStatus } from '@nestjs/common';
import { DomainError } from './base-domain.error';

enum ArticleErrorCode {
  SLUG_ALREADY_EXISTS = 'ARTICLE.SLUG_ALREADY_EXISTS',
  ARTICLE_NOT_FOUNT = 'ARTICLE.ARTICLE_NOT_FOUNT',
  ARTICLE_UNAUTHORIZED = 'ARTICLE.ARTICLE_UNAUTHORIZED',
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

export class ArticleNotFoundError extends DomainError {
  constructor() {
    super(
      ArticleErrorCode.ARTICLE_NOT_FOUNT,
      'Article not found',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ArticleUnauthorizedError extends DomainError {
  constructor(authorId: string, userId: string) {
    super(
      ArticleErrorCode.ARTICLE_UNAUTHORIZED,
      `User ${userId} is not authorized to modify article authored by ${authorId}`,
      HttpStatus.UNAUTHORIZED,
      { userId, authorId },
    );
  }
}
