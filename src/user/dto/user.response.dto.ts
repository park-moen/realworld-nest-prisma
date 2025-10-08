export class UserResponseDto {
  user: {
    email: string;
    token: string | Promise<string>;
    username: string;
    bio: string | null;
    image: string | null;
  };
}
