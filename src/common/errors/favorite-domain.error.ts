import { HttpStatus } from '@nestjs/common';
import { DomainError } from './base-domain.error';

enum FavoriteErrorCode {
  FAVORITE_NOT_FOUND = 'FAVORITE.FAVORITE_NOT_FOUND',
  FAVORITE_ALREADY_EXISTS = 'FAVORITE.FAVORITE_ALREADY_EXISTS',
}

export class FavoriteAlreadyExistsError extends DomainError {
  constructor(articleId: string, userId: string) {
    super(
      FavoriteErrorCode.FAVORITE_ALREADY_EXISTS,
      `Article ${articleId} is already favorited by user ${userId}`,
      HttpStatus.CONFLICT,
    );
  }
}

export class FavoriteNotFoundError extends DomainError {
  constructor() {
    super(
      FavoriteErrorCode.FAVORITE_NOT_FOUND,
      'Favorite not found',
      HttpStatus.NOT_FOUND,
    );
  }
}
