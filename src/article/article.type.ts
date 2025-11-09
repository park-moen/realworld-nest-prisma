import { Prisma, Tag } from '@prisma/client';
import { include } from './article.select';

// Service Type Scope
export interface IArticlePayload {
  slug: string;
  authorId: string;
  title: string;
  description: string;
  body: string;
}

// Repository Type Scope

export type ArticleWithUserPrismaType = Prisma.ArticleGetPayload<{
  include: typeof include;
}>;

export type ArticleWithTagType = {
  article: ArticleWithUserPrismaType;
  tagList: Tag[];
};
