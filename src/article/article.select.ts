import { Prisma } from '@prisma/client';

const articleSelect = Prisma.validator<Prisma.ArticleInclude>()({
  author: {
    select: {
      username: true,
      bio: true,
      image: true,
    },
  },
  tags: {
    select: {
      articleId: true,
      tagId: true,
    },
  },
  favorites: {
    select: {
      articleId: true,
      userId: true,
    },
  },
});

export const include = {
  author: articleSelect.author,
  tags: articleSelect.tags,
  favorites: articleSelect.favorites,
};
