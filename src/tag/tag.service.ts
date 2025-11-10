import { Injectable, Logger } from '@nestjs/common';
import { IArticleToTag } from './tag.type';
import { TagRepository } from './tag.repository';

@Injectable()
export class TagService {
  private readonly logger = new Logger(TagService.name);
  constructor(private readonly tagRepository: TagRepository) {}

  tagListNormalized(tagList: string[] | undefined): string[] {
    if (!tagList) {
      return [];
    }

    return tagList.map((tag) => tag.toLowerCase());
  }

  async getTagNames(articleToTag: IArticleToTag[]): Promise<string[]> {
    const tagIds = articleToTag.map((recode) => recode.tagId);
    const tagList = await this.tagRepository.findTagListByIds(tagIds);

    return tagList.map((tag) => tag.name);
  }
}
