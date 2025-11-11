import { Expose } from 'class-transformer';

export class ClearAuthorDto {
  @Expose()
  username: string;

  @Expose()
  bio: string | null;

  @Expose()
  image: string | null;

  // @Expose()
  // following: boolean;
}
