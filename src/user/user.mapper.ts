import { plainToInstance } from 'class-transformer';
import { User } from '@prisma/client';
import { ClearUserDto } from './dto/response/clear-user.dto';
import { UserResponseDto } from './dto/response/user.response.dto';

export class UserMapper {
  static toClearUserDto(entity: User, token: string): ClearUserDto {
    const plain = {
      username: entity.username,
      email: entity.email,
      token,
      bio: entity.bio,
      image: entity.image,
    };

    return plainToInstance(ClearUserDto, plain, {
      excludeExtraneousValues: true,
    });
  }

  static toUserResponse(clear: ClearUserDto): UserResponseDto {
    return plainToInstance(
      UserResponseDto,
      { user: clear },
      { excludeExtraneousValues: true },
    );
  }
}
