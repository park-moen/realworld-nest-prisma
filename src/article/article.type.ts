export interface IArticlePayload {
  slug: string;
  authorId: string;
  title: string;
  description: string;
  body: string;
}

export interface IArticleFilterParams {
  tag?: string;
  author?: string;
  favorited?: string;
  limit?: number;
  offset?: number;
}
