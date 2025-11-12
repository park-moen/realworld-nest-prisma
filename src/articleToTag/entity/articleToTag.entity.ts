import { Article } from '@app/article/entity/article.entity';
import { Tag } from '@app/tag/entity/tag.entity';

export class ArticleToTag {
  articleId: string;
  tagId: string;
  article?: Article;
  tag?: Tag;
}
