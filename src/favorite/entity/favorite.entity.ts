import { Article } from '@app/article/entity/article.entity';
import { User } from '@app/user/entity/user.entity';

export class Favorite {
  userId: string;
  articleId: string;

  user?: User;
  article?: Article;
}
