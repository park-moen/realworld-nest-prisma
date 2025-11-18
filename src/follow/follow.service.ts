import { Injectable, Logger } from '@nestjs/common';
import { FollowRepository } from './follow.repository';
import {
  AlreadyFollowingError,
  NotFollowingError,
  SelfFollowNotAllowedError,
} from '@app/common/errors/follow-domain.error';

@Injectable()
export class FollowService {
  private readonly logger = new Logger(FollowService.name);
  constructor(private readonly followRepository: FollowRepository) {}

  async getFollowingIds(followerId: string): Promise<string[]> {
    const followingIds =
      await this.followRepository.findByFollowerId(followerId);

    return followingIds.map((follow) => follow.followingId);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followRepository.exists(followerId, followingId);

    return !!follow;
  }

  async followUser(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new SelfFollowNotAllowedError(followerId, followingId);
    }

    try {
      await this.followRepository.create(followerId, followingId);
    } catch (error) {
      // ! Prisma에 의존하는 Error를 사용하고 있음
      if (error.code === 'P2002') {
        throw new AlreadyFollowingError(followerId, followingId);
      }

      throw error;
    }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new SelfFollowNotAllowedError(followerId, followingId);
    }

    try {
      await this.followRepository.delete(followerId, followingId);
    } catch (error) {
      // ! Prisma에 의존하는 Error를 사용하고 있음
      if (error.code === 'P2025') {
        throw new NotFollowingError(followerId, followingId);
      }

      throw error;
    }
  }
}
