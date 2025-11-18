import { CurrentUser } from '@app/common/decorators/current-user-decorator';
import { AccessTokenGuard } from '@app/common/guards/access-token.guard';
import { AuthUser } from '@app/common/types/auth-user';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/request/create-article.dto';
import { ArticleService } from './article.service';
import { ArticleMapper } from './article.mapper';
import {
  ArticleResponseDto,
  MultipleArticleResponseDto,
} from './dto/response/article.response.dto';
import { SlugParamDto } from '@app/common/dto/request/slug-param.dto';
import { UpdateArticleDto } from './dto/request/update-article.dto';
import { OptionalAccessTokenGuard } from '@app/common/guards/optional-access-token.guard';
import { ListArticlesQueryDto } from './dto/request/list-articles-query.dto';
import { PaginationQueryDto } from './dto/request/pagination-query.dto';

@Controller('articles')
export class ArticleController {
  private readonly logger = new Logger(ArticleController.name);

  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  async createArticle(
    @CurrentUser() user: AuthUser,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<ArticleResponseDto> {
    const article = await this.articleService.createArticle(
      createArticleDto,
      user.userId,
    );

    return ArticleMapper.toSingleArticleResponse(article);
  }

  @Put(':slug')
  @UseGuards(AccessTokenGuard)
  async updateArticleBySlug(
    @Param() { slug }: SlugParamDto,
    @Body('article') updateArticleDto: UpdateArticleDto,
    @CurrentUser() { userId }: AuthUser,
  ): Promise<ArticleResponseDto> {
    const article = await this.articleService.updateArticle(
      slug,
      updateArticleDto,
      userId,
    );

    return ArticleMapper.toSingleArticleResponse(article);
  }

  @Get('feed')
  @UseGuards(AccessTokenGuard)
  async getArticlesFeed(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ): Promise<MultipleArticleResponseDto> {
    const { articles, articlesCount } =
      await this.articleService.getArticlesFeed(query, user.userId);

    return ArticleMapper.toMultiArticleResponse(articles, articlesCount);
  }

  @Get(':slug')
  async getArticleBySlug(
    @Param() { slug }: SlugParamDto,
  ): Promise<ArticleResponseDto> {
    const article = await this.articleService.getArticleBySlug(slug);

    return ArticleMapper.toSingleArticleResponse(article);
  }

  @Get()
  @UseGuards(OptionalAccessTokenGuard)
  async getArticleListWithFilter(
    @Query() query: ListArticlesQueryDto,
    //  article.favorited 필드 값이 "내가 좋아요를 눌렀는지" boolean 결과 반환 (인증 ✅, 권한 ❌)
    @CurrentUser() user?: AuthUser,
  ): Promise<MultipleArticleResponseDto> {
    const { articles, articlesCount } =
      await this.articleService.getListArticles(query, user?.userId);

    return ArticleMapper.toMultiArticleResponse(articles, articlesCount);
  }

  @Post(':slug/favorite')
  @UseGuards(AccessTokenGuard)
  async addFavoriteBySlug(
    @CurrentUser() { userId }: AuthUser,
    @Param() { slug }: SlugParamDto,
  ): Promise<ArticleResponseDto> {
    const article = await this.articleService.addToFavorite(slug, userId);

    return ArticleMapper.toSingleArticleResponse(article);
  }

  @Delete(':slug/favorite')
  @UseGuards(AccessTokenGuard)
  async deleteFavoriteBySlug(
    @CurrentUser() { userId }: AuthUser,
    @Param() { slug }: SlugParamDto,
  ): Promise<ArticleResponseDto> {
    const article = await this.articleService.deleteToFavorite(slug, userId);

    return ArticleMapper.toSingleArticleResponse(article);
  }
}
