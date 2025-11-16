import { Injectable, Logger } from '@nestjs/common';
import { CreateArticleDto } from './dto/request/create-article.dto';
import slugify from 'slugify';
import { ArticleRepository } from './article.repository';
import {
  ArticleNotFoundError,
  ArticleUnauthorizedError,
  SlugAlreadyExistsError,
} from '@app/common/errors/article-domain.error';
import { TagService } from '@app/tag/tag.service';
import { ArticleTransaction } from './article.transaction';
import { FavoriteService } from '@app/favorite/favorite.service';
import { ClearArticleDto } from './dto/response/article.response.dto';
import { Article } from './entity/article.entity';
import { UserService } from '@app/user/user.service';
import { UpdateArticleDto } from './dto/request/update-article.dto';
import { IArticleFilterParams, IArticlePayload } from './article.type';

@Injectable()
export class ArticleService {
  private readonly logger = new Logger(ArticleService.name);

  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articleTransaction: ArticleTransaction,
    private readonly tagService: TagService,
    private readonly favoriteService: FavoriteService,
    private readonly userService: UserService,
  ) {}

  // ? Dto타입 사용은 Service가 HTTP 계층에 의존하고 있으며, Domain 로직이 외부 인터페이스에 결합됨
  // ? 프로젝트 초기 단계, 빠른 MVP 개발이 목표라서 지금은 Dto 타입을 의존한다
  // ? 추후 규모가 커지거나 다른 프로토콜을 추가하게 된다면 Interface로 분리해야 함.

  // ? slug가 동일한 article은 절대 만들 수 없는가?
  // ? 만약 동일한 slug에 대해 authorId가 다른 경우 새로운 article을 만들 수 있는 비지니스 규칙이 생기면 추가 검증 작업이 필요함.
  async createArticle(
    createArticleDto: CreateArticleDto,
    authorId: string,
  ): Promise<ClearArticleDto> {
    const slug = this.generateSlug(createArticleDto.title);
    await this.validateUniqueSlug(slug);

    const { tagList: plainTagList, ...plainArticleDto } = createArticleDto;
    const tagListNormalized = this.tagService.extractTagNames(plainTagList);
    // ! createPayload라는 점을 부각하기 위해 articleCreatePayload로 변경 예정
    const articlePayload = {
      ...plainArticleDto,
      slug,
      authorId,
    };

    const article = await this.articleTransaction.createArticleTransaction(
      articlePayload,
      tagListNormalized,
    );

    return await this.buildArticleResponse(article, authorId);
  }

  async updateArticle(
    slug: string,
    updateArticleDto: UpdateArticleDto,
    userId: string,
  ): Promise<ClearArticleDto> {
    const article = await this.findBySlugWithRelations(slug);
    if (article.authorId !== userId) {
      throw new ArticleUnauthorizedError(article.authorId, userId);
    }

    const articleUpdatePayload: Partial<IArticlePayload> = {
      ...updateArticleDto,
    };
    if (updateArticleDto.title !== undefined) {
      const newSlug = this.generateSlug(updateArticleDto.title);
      articleUpdatePayload.slug = newSlug;
    }

    const tagNames = updateArticleDto.tagList
      ? this.tagService.extractTagNames(updateArticleDto.tagList)
      : undefined;

    const updatedArticle =
      await this.articleTransaction.updateArticleTransaction(
        article.id,
        articleUpdatePayload,
        tagNames,
      );

    return this.buildArticleResponse(updatedArticle, userId);
  }

  async getListArticles(
    query: IArticleFilterParams,
    userId?: string,
  ): Promise<ClearArticleDto[]> {
    const articles =
      await this.articleRepository.findManyByQueryWithRelations(query);

    return await Promise.all(
      articles.map((article) => this.buildArticleResponse(article, userId)),
    );
  }

  async getArticleBySlug(slug: string): Promise<ClearArticleDto> {
    const article = await this.findBySlugWithRelations(slug);

    return await this.buildArticleResponse(article);
  }

  async ensureArticleExistsBySlug(slug: string): Promise<Article> {
    const article = await this.articleRepository.findBySlug(slug);

    if (!article) {
      throw new ArticleNotFoundError();
    }

    return article;
  }

  async addToFavorite(slug: string, userId: string): Promise<ClearArticleDto> {
    const article = await this.findBySlugWithRelations(slug);
    await this.favoriteService.addFavorite(article.id, userId);

    return await this.buildArticleResponse(article, userId);
  }

  async deleteToFavorite(
    slug: string,
    userId: string,
  ): Promise<ClearArticleDto> {
    const article = await this.findBySlugWithRelations(slug);
    await this.favoriteService.deleteFavorite(article.id, userId);

    return await this.buildArticleResponse(article, userId);
  }

  private async findBySlugWithRelations(slug: string): Promise<Article> {
    const article = await this.articleRepository.findBySlugWithRelations(slug);

    if (!article) {
      throw new ArticleNotFoundError();
    }

    return article;
  }

  private async validateUniqueSlug(slug: string): Promise<void> {
    const existingArticle = await this.articleRepository.findBySlug(slug);

    if (existingArticle) {
      throw new SlugAlreadyExistsError(slug);
    }
  }

  private async getFavoriteMetadata(userId: string, articleId: string) {
    const [favorited, favoritesCount] = await Promise.all([
      userId
        ? this.favoriteService.isFavorited(articleId, userId)
        : Promise.resolve(false),
      this.favoriteService.getFavoritesCount(articleId),
    ]);

    return {
      favorited,
      favoritesCount,
    };
  }

  // ! slug속성에 @unique 규약이 있고 title 속성에 @unique 규약이 존재하지 않음.
  // ! 그렇다면 title이 동일한 article에 대한 article 생성 불가능 비지니스 규칙이 올바른 비지니스 규칙인가?
  // ! title은 언제든지 동일한 다른 article이 존재할 수 있어야 한다고 생각함
  // ! Slug 생성 메서드에 articleId의 일부를 추가하는 방법으로 slug 속성만을 고유한 값으로 만드는게 올바름
  private generateSlug(title: string): string {
    return slugify(title, {
      lower: true,
      strict: true,
      locale: 'vi',
    });
  }

  private async buildArticleResponse(
    article: Article,
    userId?: string,
  ): Promise<ClearArticleDto> {
    const author =
      article.auth ?? (await this.userService.getUserById(article.authorId));
    const tagNames = article.tags
      ? await this.tagService.getTagNames(article.tags)
      : [];
    const favoriteMetaData = await this.getFavoriteMetadata(userId, article.id);

    return {
      ...article,
      author,
      tags: tagNames,
      ...favoriteMetaData,
    };
  }
}
