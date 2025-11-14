import { FollowService } from '@app/follow/follow.service';
import { UserService } from '@app/user/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { ProfileDto } from './dto/response/profile.response.dto';

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

    return {
      username: following.username,
      bio: following.bio,
      image: following.image,
      following: true,
    };
  }
}
