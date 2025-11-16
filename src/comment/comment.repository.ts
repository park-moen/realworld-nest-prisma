import { PrismaService } from '@app/prisma/prisma.service';
import { PrismaTransaction } from '@app/prisma/transaction.type';
import { Injectable, Logger } from '@nestjs/common';
import { ICommentCreatePayload } from './comment.type';
import { Comment, Prisma } from '@prisma/client';

@Injectable()
export class CommentRepository {
  private readonly logger = new Logger(CommentRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(
    payload: ICommentCreatePayload,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<Prisma.CommentGetPayload<{ include: { author: boolean } }>> {
    const comment = await prisma.comment.create({
      data: payload,
      include: {
        author: true,
      },
    });

    return comment;
  }

  async findManyByArticleId(
    articleId: string,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<Prisma.CommentGetPayload<{ include: { author: boolean } }>[]> {
    return await prisma.comment.findMany({
      where: { articleId },
      include: {
        author: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCommentId(
    commentId: string,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<Comment | null> {
    return await prisma.comment.findUnique({
      where: { id: commentId },
    });
  }

  async delete(
    id: string,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<void> {
    await prisma.comment.delete({
      where: { id },
    });
  }
}
