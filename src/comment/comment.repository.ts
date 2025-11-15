import { PrismaService } from '@app/prisma/prisma.service';
import { PrismaTransaction } from '@app/prisma/transaction.type';
import { Injectable, Logger } from '@nestjs/common';
import { ICommentCreatePayload } from './comment.type';
import { Prisma } from '@prisma/client';

@Injectable()
export class CommentRepository {
  private readonly logger = new Logger(CommentRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(
    payload: ICommentCreatePayload,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<Prisma.CommentGetPayload<{ include: { author: boolean } }>> {
    const comment = prisma.comment.create({
      data: payload,
      include: {
        author: true,
      },
    });

    return comment;
  }
}
