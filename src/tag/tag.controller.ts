import { Controller, Get } from '@nestjs/common';
import { TagListResponseDto } from './dto/response/tag.response.dto';
import { TagService } from './tag.service';
import { TagMapper } from './tag.mapper';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async findAllTagList(): Promise<TagListResponseDto> {
    const tags = await this.tagService.findAllTagList();

    return TagMapper.toResponseTagList(tags);
  }
}
