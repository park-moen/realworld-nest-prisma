import { plainToInstance } from 'class-transformer';
import {
  ProfileDto,
  ProfileResponseDto,
} from './dto/response/profile.response.dto';

export class ProfileMapper {
  static toResponseProfile(profile: ProfileDto) {
    return plainToInstance(
      ProfileResponseDto,
      { profile },
      { excludeExtraneousValues: true },
    );
  }
}
