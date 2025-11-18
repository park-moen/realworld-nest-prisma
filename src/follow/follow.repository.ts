import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FollowRepository {
  private readonly logger = new Logger(FollowRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(followerId: string, followingId: string): Promise<void> {
    await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });
  }

  async delete(followerId: string, followingId: string): Promise<void> {
    await this.prisma.follow.delete({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });
  }

  async exists(followerId: string, followingId: string): Promise<boolean> {
    const count = await this.prisma.follow.count({
      where: {
        followerId,
        followingId,
      },
    });

    return count > 0;
  }

  async findByFollowerId(
    followerId: string,
  ): Promise<{ followingId: string }[]> {
    return await this.prisma.follow.findMany({
      where: { followerId },
      select: { followingId: true },
    });
  }
}
