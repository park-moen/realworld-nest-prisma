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

  async exists(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findFirst({
      where: {
        followerId,
        followingId,
      },
    });

    return !!follow;
  }
}
