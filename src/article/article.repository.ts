import { PrismaService } from '@app/prisma/prisma.service';
import { PrismaTransaction } from '@app/prisma/transaction.type';
import { Injectable } from '@nestjs/common';
import { Article, Prisma } from '@prisma/client';
import { include } from './article.select';
import { IArticlePayload } from './article.type';

@Injectable()
export class ArticleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    payload: Prisma.XOR<
      Prisma.ArticleCreateInput,
      Prisma.ArticleUncheckedCreateInput
    >,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<Article> {
    return await prisma.article.create({
      data: payload,
    });
  }

  async update(
    id: string,
    payload: Partial<IArticlePayload>,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<Article> {
    return prisma.article.update({
      where: { id },
      data: {
        slug: payload?.slug,
        title: payload?.title,
        body: payload?.body,
        description: payload?.description,
      },
    });
  }

  async findBySlug(
    slug: string,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<Article> {
    return await prisma.article.findUnique({
      where: { slug },
    });
  }

  async findById(
    id: string,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<Article | null> {
    return await prisma.article.findUnique({
      where: { id },
    });
  }

  async findBySlugWithRelations(
    slug: string,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<Prisma.ArticleGetPayload<{
    include: typeof include;
  }> | null> {
    return await prisma.article.findUnique({
      where: { slug },
      include,
    });
  }

  async findByIdWithRelations(
    id: string,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<
    Prisma.ArticleGetPayload<{
      include: typeof include;
    }>
  > {
    return await prisma.article.findUnique({
      where: { id },
      include,
    });
  }
}
