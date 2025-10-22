import { Expose, Type } from 'class-transformer';
import { ClearUserDto } from './clear-user.dto';

export class UserResponseDto {
  @Expose()
  @Type(() => ClearUserDto)
  user: ClearUserDto;
}
