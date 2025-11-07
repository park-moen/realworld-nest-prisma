import { HttpStatus } from '@nestjs/common';
import { DomainError } from './base-domain.error';

enum UserErrorCode {
  USER_NOT_FOUND = 'USER.USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'USER.EMAIL_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS = 'USER.USERNAME_ALREADY_EXISTS',
  EMAIL_MISMATCH = 'USER.EMAIL_MISMATCH',
  PASSWORD_MISMATCH = 'USER.PASSWORD_MISMATCH',
  INVALID_OLD_PASSWORD = 'USER.INVALID_OLD_PASSWORD',
}

export class UserNotFoundError extends DomainError {
  constructor(identifier: string) {
    super(
      UserErrorCode.USER_NOT_FOUND,
      'User not found',
      HttpStatus.NOT_FOUND,
      {
        identifier,
      },
    );
  }
}

export class EmailAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(
      UserErrorCode.EMAIL_ALREADY_EXISTS,
      'Email already exists',
      HttpStatus.CONFLICT,
      { email },
    );
  }
}

export class UsernameAlreadyExistsError extends DomainError {
  constructor(username: string) {
    super(
      UserErrorCode.USERNAME_ALREADY_EXISTS,
      'Email already exists',
      HttpStatus.CONFLICT,
      { username },
    );
  }
}

export class EmailMismatchError extends DomainError {
  constructor() {
    super(
      UserErrorCode.EMAIL_MISMATCH,
      'Current email is incorrect',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class PasswordMismatchError extends DomainError {
  constructor() {
    super(
      UserErrorCode.PASSWORD_MISMATCH,
      'Current password is incorrect',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class InvalidOldPasswordError extends DomainError {
  constructor() {
    super(
      UserErrorCode.INVALID_OLD_PASSWORD,
      'The provided old password is incorrect',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
