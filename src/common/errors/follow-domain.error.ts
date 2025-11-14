import { HttpStatus } from '@nestjs/common';
import { DomainError } from './base-domain.error';

enum FollowErrorCode {
  SELF_FOLLOW_NOT_ALLOWED = 'FOLLOW.SELF_FOLLOW_NOT_ALLOWED',
  ALREADY_FOLLOWING = 'FOLLOW.ALREADY_FOLLOWING',
  NOT_FOLLOWING = 'FOLLOW.NOT_FOLLOWING',
  FOLLOW_TARGET_NOT_FOUND = 'FOLLOW.TARGET_NOT_FOUND',
}

// 자기 자신 팔로우 시도

export class SelfFollowNotAllowedError extends DomainError {
  constructor(followerId: string, followingId: string) {
    super(
      FollowErrorCode.SELF_FOLLOW_NOT_ALLOWED,
      'You cannot follow yourself',
      HttpStatus.BAD_REQUEST,
      { followerId, followingId },
    );
  }
}

// 이미 팔로우 중
export class AlreadyFollowingError extends DomainError {
  constructor(followerId: string, followingId: string) {
    super(
      FollowErrorCode.ALREADY_FOLLOWING,
      `${followerId} is already following ${followingId}`,
      HttpStatus.CONFLICT,
      { followerId, followingId },
    );
  }
}

// 팔로우하지 않은 유저 언팔로우 시도
export class NotFollowingError extends DomainError {
  constructor(followerId: string, followingId: string) {
    super(
      FollowErrorCode.NOT_FOLLOWING,
      `${followerId} is not following ${followingId}`,
      HttpStatus.NOT_FOUND,
      { followerId, followingId },
    );
  }
}

// 존재하지 않는 유저 팔로우 시도
export class FollowTargetNotFoundError extends DomainError {
  constructor() {
    super(
      FollowErrorCode.FOLLOW_TARGET_NOT_FOUND,
      `User not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}
