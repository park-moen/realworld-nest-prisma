import { plainToInstance } from 'class-transformer';
import { TagListResponseDto } from './dto/response/tag.response.dto';

export class TagMapper {
  static toResponseTagList(tags: string[]): TagListResponseDto {
    console.log('tags', tags);

    return plainToInstance(
      TagListResponseDto,
      { tags },
      { excludeExtraneousValues: true },
    );
  }
}
