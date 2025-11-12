import { ArticleToTag } from '@app/articleToTag/entity/articleToTag.entity';
import { Favorite } from '@app/favorite/entity/favorite.entity';
import { User } from '@app/user/entity/user.entity';

export class Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;

  auth?: User;
  tags?: ArticleToTag[];
  favorites?: Favorite[];
}
