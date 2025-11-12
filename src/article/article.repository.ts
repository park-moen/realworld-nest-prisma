import { PrismaService } from '@app/prisma/prisma.service';
import { PrismaTransaction } from '@app/prisma/transaction.type';
import { Injectable } from '@nestjs/common';
import { Article, Prisma } from '@prisma/client';
import { include } from './article.select';

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

  async findBySlug(
    slug: string,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<Article> {
    return await prisma.article.findUnique({
      where: { slug },
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
