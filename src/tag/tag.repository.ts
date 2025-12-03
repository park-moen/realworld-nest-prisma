import { PrismaService } from '@app/prisma/prisma.service';
import { PrismaTransaction } from '@app/prisma/transaction.type';
import { Injectable } from '@nestjs/common';
import { Tag } from '@prisma/client';

@Injectable()
export class TagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTagByList(
    tagNames: string[],
    prisma: PrismaTransaction = this.prisma,
  ): Promise<void> {
    await prisma.tag.createMany({
      data: tagNames.map((tagName) => ({ name: tagName })),
      skipDuplicates: true,
    });
  }

  async findTagListByTagNames(
    tagNames: string[],
    prisma: PrismaTransaction = this.prisma,
  ): Promise<Tag[]> {
    return await prisma.tag.findMany({
      where: {
        name: {
          in: tagNames,
        },
      },
    });
  }

  async findTagListByIds(
    tagsId: string[],
    prisma: PrismaTransaction = this.prisma,
  ): Promise<Tag[]> {
    return await prisma.tag.findMany({
      where: {
        id: {
          in: tagsId,
        },
      },
    });
  }

  async findManyTags(prisma: PrismaTransaction = this.prisma): Promise<Tag[]> {
    return await prisma.tag.findMany();
  }
}
