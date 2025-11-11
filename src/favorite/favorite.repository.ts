import { PrismaService } from '@app/prisma/prisma.service';
import { PrismaTransaction } from '@app/prisma/transaction.type';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FavoriteRepository {
  private readonly logger = new Logger(FavoriteRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(
    articleId: string,
    userId: string,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<void> {
    await prisma.favorite.create({
      data: { articleId, userId },
    });
  }
  async delete(
    articleId: string,
    userId: string,
    prisma: PrismaTransaction = this.prisma,
  ): Promise<void> {
    await prisma.favorite.delete({
      where: {
        userId_articleId: { userId, articleId },
      },
    });
  }
}
