import { CurrentUser } from '@app/common/decorators/current-user-decorator';
import { AccessTokenGuard } from '@app/common/guards/access-token.guard';
import { AuthUser } from '@app/common/types/auth-user';
import {
  Controller,
  Delete,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserNameParamDto } from './dto/request/username-param.dto';
import { ProfileService } from './profile.service';
import { ProfileResponseDto } from './dto/response/profile.response.dto';
import { ProfileMapper } from './profile.mapper';

@Controller('profiles')
@UseGuards(AccessTokenGuard)
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);
  constructor(private readonly profileService: ProfileService) {}

  @Post(':username/follow')
  async followProfile(
    @CurrentUser() { userId }: AuthUser,
    @Param() { username }: UserNameParamDto,
  ): Promise<ProfileResponseDto> {
    const profile = await this.profileService.followProfile(username, userId);

    return ProfileMapper.toResponseProfile(profile);
  }

  @Delete(':username/follow')
  async unfollowProfile(
    @CurrentUser() { userId }: AuthUser,
    @Param() { username }: UserNameParamDto,
  ): Promise<ProfileResponseDto> {
    const profile = await this.profileService.unfollowProfile(username, userId);

    return ProfileMapper.toResponseProfile(profile);
  }
}
