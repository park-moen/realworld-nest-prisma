import { Injectable, Logger } from '@nestjs/common';
import { CreateArticleDto } from './dto/request/create-article.dto';
import slugify from 'slugify';
import { ArticleRepository } from './article.repository';
import {
  ArticleNotFoundError,
  SlugAlreadyExistsError,
} from '@app/common/errors/article-domain.error';
import { TagService } from '@app/tag/tag.service';
import { ArticleTransaction } from './article.transaction';
import { ArticleWithTagNamesType } from './article.type';

@Injectable()
export class ArticleService {
  private readonly logger = new Logger(ArticleService.name);

  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articleTransaction: ArticleTransaction,
    private readonly tagService: TagService,
  ) {}

  // ? Dto타입 사용은 Service가 HTTP 계층에 의존하고 있으며, Domain 로직이 외부 인터페이스에 결합됨
  // ? 프로젝트 초기 단계, 빠른 MVP 개발이 목표라서 지금은 Dto 타입을 의존한다
  // ? 추후 규모가 커지거나 다른 프로토콜을 추가하게 된다면 Interface로 분리해야 함.
  async createArticle(
    createArticleDto: CreateArticleDto,
    authorId: string,
  ): Promise<ArticleWithTagNamesType> {
    const slug = this.generateSlug(createArticleDto.title);

    await this.validateUniqueSlug(slug);

    const { tagList: plainTagList, ...plainArticleDto } = createArticleDto;

    const tagListNormalized = this.tagService.tagListNormalized(plainTagList);
    const articlePayload = {
      ...plainArticleDto,
      slug,
      authorId,
    };

    await this.articleTransaction.createArticleTransaction(
      articlePayload,
      tagListNormalized,
    );

    return await this.findRawBySlugWithTagNames(slug);
  }

  async getArticleBySlug(slug: string): Promise<ArticleWithTagNamesType> {
    const articleWithTagNames = await this.findRawBySlugWithTagNames(slug);

    return articleWithTagNames;
  }

  private async findRawBySlugWithTagNames(
    slug: string,
  ): Promise<ArticleWithTagNamesType> {
    const article = await this.articleRepository.findBySlug(slug);
    const articleToTag = article?.tags;

    if (!article) {
      throw new ArticleNotFoundError();
    }

    const tagNames = await this.tagService.getTagNames(articleToTag);

    return { ...article, tags: tagNames };
  }

  private generateSlug(title: string): string {
    return slugify(title, {
      lower: true,
      strict: true,
      locale: 'vi',
    });
  }

  private async validateUniqueSlug(slug: string): Promise<void> {
    const existingArticle = await this.articleRepository.findBySlug(slug);

    if (existingArticle) {
      throw new SlugAlreadyExistsError(slug);
    }
  }
}
