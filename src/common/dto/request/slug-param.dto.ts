import { IsNotEmpty, Matches } from 'class-validator';

export class SlugParamDto {
  @IsNotEmpty({ message: 'Slug cannot be empty or only whitespace' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Invalid slug format' })
  slug: string;
}
