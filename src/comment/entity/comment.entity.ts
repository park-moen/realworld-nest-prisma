import { User } from '@app/user/entity/user.entity';

export class Comment {
  id: string;
  body: string;
  authorId: string;
  articleId: string;
  createdAt: Date;
  updatedAt: Date;

  author?: User;
}
