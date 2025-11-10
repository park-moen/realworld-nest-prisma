import { Article } from './entity/article.entity';

// Service Type Scope
export interface IArticlePayload {
  slug: string;
  authorId: string;
  title: string;
  description: string;
  body: string;
}

export type ArticleWithTagNamesType = Omit<Article, 'tags'> & {
  tags: string[];
};
