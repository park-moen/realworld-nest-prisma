import { PrismaService } from '@app/prisma/prisma.service';
import { PrismaTransaction } from '@app/prisma/transaction.type';
import { Injectable } from '@nestjs/common';
import { Tag } from '@prisma/client';

@Injectable()
export class ArticleToTagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createArticleToTag(
    articleId: string,
    tagList: Tag[],
    prisma: PrismaTransaction = this.prisma,
  ): Promise<void> {
    await prisma.articleTag.createMany({
      data: tagList.map((tag) => ({
        articleId,
        tagId: tag.id,
      })),
    });
  }

  async deleteArticleToTag(
    articleId: string,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<void> {
    await prisma.articleTag.deleteMany({
      where: { articleId },
    });
  }
}
