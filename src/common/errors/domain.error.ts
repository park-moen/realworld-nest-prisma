import { HttpStatus } from '@nestjs/common';

export enum ErrorCode {
  // Auth
  TOKEN_EXPIRED = 'AUTH.TOKEN_EXPIRED',
  TOKEN_INVALID = 'AUTH.TOKEN_INVALID',
  TOKEN_NOT_FOUND = 'AUTH.TOKEN_NOT_FOUND',
  REFRESH_TOKEN_REVOKED = 'AUTH.REFRESH_TOKEN_REVOKED',
  INVALID_CREDENTIALS = 'AUTH.INVALID_CREDENTIALS',

  // User
  USER_NOT_FOUND = 'USER.USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'USER.EMAIL_ALREADY_EXISTS',
  EMAIL_MISMATCH = 'USER.EMAIL_MISMATCH',
  PASSWORD_MISMATCH = 'USER.PASSWORD_MISMATCH',
  INVALID_OLD_PASSWORD = 'USER.INVALID_OLD_PASSWORD',
}

export abstract class DomainError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly httpStatus: number,
    public readonly details?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UserNotFoundError extends DomainError {
  constructor(identifier: string) {
    super(ErrorCode.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND, {
      identifier,
    });
  }
}

export class EmailAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(
      ErrorCode.EMAIL_ALREADY_EXISTS,
      'Email already exists',
      HttpStatus.CONFLICT,
      { email },
    );
  }
}

export class EmailMismatchError extends DomainError {
  constructor() {
    super(
      ErrorCode.EMAIL_MISMATCH,
      'Current email is incorrect',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class PasswordMismatchError extends DomainError {
  constructor() {
    super(
      ErrorCode.PASSWORD_MISMATCH,
      'Current password is incorrect',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class TokenExpiredError extends DomainError {
  constructor(tokenType: 'access' | 'refresh') {
    super(
      ErrorCode.TOKEN_EXPIRED,
      `${tokenType} token has expired`,
      HttpStatus.UNAUTHORIZED,
      { tokenType },
    );
  }
}

export class TokenNotFoundError extends DomainError {
  constructor(tokenType: 'access' | 'refresh') {
    super(
      ErrorCode.TOKEN_NOT_FOUND,
      'Token not found',
      HttpStatus.UNAUTHORIZED,
      { tokenType },
    );
  }
}

export class TokenInvalidError extends DomainError {
  constructor(tokenType: 'access' | 'refresh') {
    super(
      ErrorCode.TOKEN_INVALID,
      `${tokenType} token validation failed`,
      HttpStatus.UNAUTHORIZED,
      { tokenType },
    );
  }
}

export class RefreshTokenRevokedError extends DomainError {
  constructor(jti: string) {
    super(
      ErrorCode.REFRESH_TOKEN_REVOKED,
      'Refresh token has been revoked',
      HttpStatus.UNAUTHORIZED,
      { jti },
    );
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super(
      ErrorCode.INVALID_CREDENTIALS,
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class InvalidOldPasswordError extends DomainError {
  constructor() {
    super(
      ErrorCode.INVALID_OLD_PASSWORD,
      'The provided old password is incorrect',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
