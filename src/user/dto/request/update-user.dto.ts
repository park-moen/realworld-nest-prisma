import { IsImageStorageUrl } from '@app/common/validators/is-image-storage-url';
import { AtLeastOneField, NotEqual } from '@app/common/validators/update.rules';
import {
  IsDefined,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(8)
  @ValidateIf((o) => o.passwordOld !== undefined) // passwordOld가 있을 때는 password도 필수
  @IsDefined({ message: 'password is required when passwordOld is provided' })
  password?: string;

  @IsString()
  @MinLength(8)
  @ValidateIf((o) => o.password !== undefined) // password가 있을 때는 passwordOld도 필수
  @IsDefined({ message: 'passwordOld is required when password is provided' })
  passwordOld?: string;

  @IsString()
  @IsOptional()
  @IsImageStorageUrl()
  image?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @AtLeastOneField([
    'username',
    'email',
    'password',
    'passwordOld',
    'image',
    'bio',
  ])
  @NotEqual('password', 'passwordOld', {
    message: 'password must differ from passwordOld',
  })
  _rules!: string;
}
