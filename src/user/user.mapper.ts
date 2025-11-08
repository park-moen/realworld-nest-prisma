import { plainToInstance } from 'class-transformer';
import { User } from '@prisma/client';

import { UserResponseDto } from './dto/response/user.response.dto';
import { RefreshResponseDto } from './dto/response/refresh.response.dto';

export class UserMapper {
  static toUserResponseFromEntity(
    entity: User,
    token: string,
  ): UserResponseDto {
    const plain = {
      username: entity.username,
      email: entity.email,
      token,
      bio: entity.bio,
      image: entity.image,
    };

    return plainToInstance(
      UserResponseDto,
      { user: plain },
      { excludeExtraneousValues: true },
    );
  }

  static toRefreshResponse(accessToken: string): RefreshResponseDto {
    return plainToInstance(
      RefreshResponseDto,
      { user: { token: accessToken } },
      { excludeExtraneousValues: true },
    );
  }
}
