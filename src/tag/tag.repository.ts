import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Tag } from '@prisma/client';

@Injectable()
export class TagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTagByList(tagListName: string[]): Promise<Tag[]> {
    return await this.prisma.tag.createManyAndReturn({
      data: tagListName.map((tagName) => ({ name: tagName })),
      skipDuplicates: true,
    });
  }
}
