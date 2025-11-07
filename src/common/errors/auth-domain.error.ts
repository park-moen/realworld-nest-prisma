import { HttpStatus } from '@nestjs/common';
import { DomainError } from './base-domain.error';

enum AuthErrorCode {
  // Auth
  TOKEN_EXPIRED = 'AUTH.TOKEN_EXPIRED',
  TOKEN_INVALID = 'AUTH.TOKEN_INVALID',
  TOKEN_NOT_FOUND = 'AUTH.TOKEN_NOT_FOUND',
  REFRESH_TOKEN_REVOKED = 'AUTH.REFRESH_TOKEN_REVOKED',
  INVALID_CREDENTIALS = 'AUTH.INVALID_CREDENTIALS',
}

export class TokenExpiredError extends DomainError {
  constructor(tokenType: 'access' | 'refresh', expiredAt: Date) {
    super(
      AuthErrorCode.TOKEN_EXPIRED,
      `${tokenType} token has expired`,
      HttpStatus.UNAUTHORIZED,
      { tokenType, expiredAt },
    );
  }
}

export class TokenNotFoundError extends DomainError {
  constructor(tokenType: 'access' | 'refresh') {
    super(
      AuthErrorCode.TOKEN_NOT_FOUND,
      'Token not found',
      HttpStatus.UNAUTHORIZED,
      { tokenType },
    );
  }
}

export class TokenInvalidError extends DomainError {
  constructor(tokenType: 'access' | 'refresh') {
    super(
      AuthErrorCode.TOKEN_INVALID,
      `${tokenType} token validation failed`,
      HttpStatus.UNAUTHORIZED,
      { tokenType },
    );
  }
}

export class RefreshTokenRevokedError extends DomainError {
  constructor(jti: string) {
    super(
      AuthErrorCode.REFRESH_TOKEN_REVOKED,
      'Refresh token has been revoked',
      HttpStatus.UNAUTHORIZED,
      { jti },
    );
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super(
      AuthErrorCode.INVALID_CREDENTIALS,
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
