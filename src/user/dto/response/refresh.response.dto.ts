import { Expose } from 'class-transformer';

export class RefreshResponseDto {
  @Expose()
  user: {
    token: string;
  };
}
