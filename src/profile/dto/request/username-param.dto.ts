import { IsNotEmpty, IsString } from 'class-validator';

export class UserNameParamDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
