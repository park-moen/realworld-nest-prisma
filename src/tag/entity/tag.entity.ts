import { Article } from '@app/article/entity/article.entity';

export class Tag {
  id: string;
  name: string;
  post?: Article;
}
