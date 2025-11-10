import { CurrentUser } from '@app/common/decorators/current-user-decorator';
import { AccessTokenGuard } from '@app/common/guards/access-token.guard';
import { AuthUser } from '@app/common/types/auth-user';
import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/request/create-article.dto';
import { ArticleService } from './article.service';
import { ArticleMapper } from './article.mapper';
import { ArticleResponseDto } from './dto/response/article.response.dto';
import { SlugParamDto } from './dto/request/slug-param.dto';

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

  @Get(':slug')
  async getArticleBySlug(
    @Param() { slug }: SlugParamDto,
  ): Promise<ArticleResponseDto> {
    const article = await this.articleService.getArticleBySlug(slug);

    return ArticleMapper.toSingleArticleResponse(article);
  }
}
