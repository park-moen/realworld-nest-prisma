import { FollowService } from '@app/follow/follow.service';
import { UserService } from '@app/user/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { ProfileDto } from './dto/response/profile.response.dto';
import { User } from '@app/user/entity/user.entity';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);
  constructor(
    private readonly userService: UserService,
    private readonly followService: FollowService,
  ) {}

  async followProfile(
    username: string,
    followerId: string,
  ): Promise<ProfileDto> {
    const following = await this.userService.getUserByName(username);

    await this.followService.followUser(followerId, following.id);

    return this.buildProfileResponse(following, followerId);
  }

  async unfollowProfile(
    username: string,
    followerId: string,
  ): Promise<ProfileDto> {
    const following = await this.userService.getUserByName(username);

    await this.followService.unfollowUser(followerId, following.id);

    return this.buildProfileResponse(following, followerId);
  }

  private async buildProfileResponse(
    user: User,
    currentUserId?: string,
  ): Promise<ProfileDto> {
    const isFollowing = currentUserId
      ? await this.followService.isFollowing(currentUserId, user.id)
      : false;

    return {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following: isFollowing,
    };
  }
}
