import { Expose, Transform, Type } from 'class-transformer';

class ClearUserDto {
  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  token: string;

  @Expose()
  @Transform(({ value }) => value ?? null, { toPlainOnly: true })
  bio: string | null;

  @Expose()
  @Transform(({ value }) => value ?? null, { toPlainOnly: true })
  image: string | null;
}

export class UserResponseDto {
  @Expose()
  @Type(() => ClearUserDto)
  user: ClearUserDto;
}
