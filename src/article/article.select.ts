import { Prisma } from '@prisma/client';

const articleSelect = Prisma.validator<Prisma.ArticleInclude>()({
  author: {
    select: {
      id: true,
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
});

export const include = {
  author: articleSelect.author,
  tags: articleSelect.tags,
};
