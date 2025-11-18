import { PrismaService } from '@app/prisma/prisma.service';
import { PrismaTransaction } from '@app/prisma/transaction.type';
import { Injectable, Logger } from '@nestjs/common';
import { Article, Prisma } from '@prisma/client';
import { include } from './article.select';
import { IArticleFilterParams, IArticlePayload } from './article.type';

@Injectable()
export class ArticleRepository {
  private readonly logger = new Logger(ArticleRepository.name);
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

  async delete(
    slug: string,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<void> {
    await prisma.article.delete({ where: { slug } });
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

  async findManyByQueryWithRelations(
    queryParams: IArticleFilterParams,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<
    Prisma.ArticleGetPayload<{
      include: typeof include;
    }>[]
  > {
    const where = this.prepareWhereParams(queryParams);

    return await prisma.article.findMany({
      include,
      where,
      take: queryParams.limit,
      skip: queryParams.offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findManyByAuthorIds(
    authorIds: string[],
    queryParams: IArticleFilterParams,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<Prisma.ArticleGetPayload<{ include: typeof include }>[]> {
    return await prisma.article.findMany({
      where: {
        authorId: {
          in: authorIds,
        },
      },
      include,
      take: queryParams.limit,
      skip: queryParams.offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countFeed(
    queryParams: IArticleFilterParams,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<number> {
    const where = this.prepareWhereParams(queryParams);

    return await prisma.article.count({ where });
  }

  async countFollow(
    authorIds: string[],
    prisma: PrismaTransaction = this.prisma,
  ): Promise<number> {
    return await prisma.article.count({
      where: {
        authorId: { in: authorIds },
      },
    });
  }

  private prepareWhereParams(
    params: IArticleFilterParams,
  ): Prisma.ArticleWhereInput {
    const and: Prisma.ArticleWhereInput[] = [];

    if (params.tag) {
      and.push({
        tags: {
          some: {
            tag: {
              name: params.tag,
            },
          },
        },
      });
    }

    if (params.author) {
      and.push({
        author: {
          username: params.author,
        },
      });
    }

    if (params.favorited) {
      and.push({
        favorites: {
          some: {
            user: {
              username: params.favorited,
            },
          },
        },
      });
    }

    return and.length ? { AND: and } : {};
  }
}
