import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, RefreshToken } from '@prisma/client';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<RefreshToken | null> {
    return await this.prisma.refreshToken.findUnique({ where: { id } });
  }

  async save(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken> {
    return await this.prisma.refreshToken.create({ data });
  }

  async revoke(id: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}
