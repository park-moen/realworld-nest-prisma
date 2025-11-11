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
import { FavoriteService } from '@app/favorite/favorite.service';
import { ClearArticleDto } from './dto/response/article.response.dto';

@Injectable()
export class ArticleService {
  private readonly logger = new Logger(ArticleService.name);

  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articleTransaction: ArticleTransaction,
    private readonly tagService: TagService,
    private readonly favoriteService: FavoriteService,
  ) {}

  // ? Dto타입 사용은 Service가 HTTP 계층에 의존하고 있으며, Domain 로직이 외부 인터페이스에 결합됨
  // ? 프로젝트 초기 단계, 빠른 MVP 개발이 목표라서 지금은 Dto 타입을 의존한다
  // ? 추후 규모가 커지거나 다른 프로토콜을 추가하게 된다면 Interface로 분리해야 함.
  async createArticle(
    createArticleDto: CreateArticleDto,
    authorId: string,
  ): Promise<ClearArticleDto> {
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

    return await this.getArticleWithCompletedData(slug, authorId);
  }

  async getArticleBySlug(slug: string): Promise<ClearArticleDto> {
    return await this.getArticleWithCompletedData(slug);
  }

  async addToFavorite(slug: string, userId: string): Promise<ClearArticleDto> {
    const article = await this.articleRepository.findBySlug(slug);

    if (!article) {
      throw new ArticleNotFoundError();
    }

    await this.favoriteService.addFavorite(article.id, userId);

    return await this.getArticleWithCompletedData(slug, userId);
  }

  async deleteToFavorite(
    slug: string,
    userId: string,
  ): Promise<ClearArticleDto> {
    const article = await this.articleRepository.findBySlug(slug);

    if (!article) {
      throw new ArticleNotFoundError();
    }

    await this.favoriteService.deleteFavorite(article.id, userId);

    return await this.getArticleWithCompletedData(slug, userId);
  }

  private async getArticleWithCompletedData(
    slug: string,
    userId?: string,
  ): Promise<ClearArticleDto> {
    const article = await this.articleRepository.findBySlug(slug);

    if (!article) {
      throw new ArticleNotFoundError();
    }

    const articleToTag = article?.tags;
    const tagNames = await this.tagService.getTagNames(articleToTag);

    const isFavorited = userId
      ? await this.favoriteService.isFavorited(article.id, userId)
      : false;
    const favoritesCount = await this.favoriteService.getFavoritesCount(
      article.id,
    );

    return {
      ...article,
      tags: tagNames,
      favorited: isFavorited,
      favoritesCount,
    };
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
