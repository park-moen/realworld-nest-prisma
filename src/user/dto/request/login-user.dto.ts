import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: '이멜일 형식이 올바르지 않습니다.' })
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이여야 합니다.' })
  password: string;
}
