import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Article, Prisma } from '@prisma/client';

@Injectable()
export class ArticleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    payload: Prisma.XOR<
      Prisma.ArticleCreateInput,
      Prisma.ArticleUncheckedCreateInput
    >,
  ): Promise<Article> {
    return await this.prisma.article.create({
      data: payload,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            bio: true,
            image: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Article | null> {
    return await this.prisma.article.findUnique({
      where: { slug },
    });
  }
}
