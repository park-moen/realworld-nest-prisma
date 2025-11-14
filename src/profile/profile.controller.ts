import { CurrentUser } from '@app/common/decorators/current-user-decorator';
import { AccessTokenGuard } from '@app/common/guards/access-token.guard';
import { AuthUser } from '@app/common/types/auth-user';
import {
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserNameParamDto } from './dto/request/username-param.dto';
import { ProfileService } from './profile.service';
import { ProfileResponseDto } from './dto/response/profile.response.dto';
import { ProfileMapper } from './profile.mapper';
import { OptionalAccessTokenGuard } from '@app/common/guards/optional-access-token.guard';

@Controller('profiles')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  @UseGuards(OptionalAccessTokenGuard)
  async getProfile(
    @Param() { username }: UserNameParamDto,
    @CurrentUser() user?: AuthUser,
  ) {
    const profile = await this.profileService.getProfile(
      username,
      user?.userId,
    );

    return ProfileMapper.toResponseProfile(profile);
  }

  @Post(':username/follow')
  @UseGuards(AccessTokenGuard)
  async followProfile(
    @CurrentUser() { userId }: AuthUser,
    @Param() { username }: UserNameParamDto,
  ): Promise<ProfileResponseDto> {
    const profile = await this.profileService.followProfile(username, userId);

    return ProfileMapper.toResponseProfile(profile);
  }

  @Delete(':username/follow')
  @UseGuards(AccessTokenGuard)
  async unfollowProfile(
    @CurrentUser() { userId }: AuthUser,
    @Param() { username }: UserNameParamDto,
  ): Promise<ProfileResponseDto> {
    const profile = await this.profileService.unfollowProfile(username, userId);

    return ProfileMapper.toResponseProfile(profile);
  }
}
