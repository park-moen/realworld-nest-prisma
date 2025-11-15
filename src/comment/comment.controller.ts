import { SlugParamDto } from '@app/article/dto/request/slug-param.dto';
import { CurrentUser } from '@app/common/decorators/current-user-decorator';
import { AccessTokenGuard } from '@app/common/guards/access-token.guard';
import { AuthUser } from '@app/common/types/auth-user';
import {
  Body,
  Controller,
  Delete,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/request/create-comment.dto';
import { SingleCommentResponseDto } from './dto/response/comment.response.dto';
import { CommentMapper } from './comment.mapper';
import { deleteCommentParamDto } from './dto/request/delete-comment-param.dto';

@Controller('articles/:slug/comments')
export class CommentController {
  private readonly logger = new Logger(CommentController.name);
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  async createComment(
    @CurrentUser() user: AuthUser,
    @Param() { slug }: SlugParamDto,
    @Body('comment') createCommentDto: CreateCommentDto,
  ): Promise<SingleCommentResponseDto> {
    const comment = await this.commentService.createComment(
      slug,
      user.userId,
      createCommentDto,
    );

    return CommentMapper.toResponseComment(comment);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  async deleteComment(
    @Param() { slug, id }: deleteCommentParamDto,
  ): Promise<void> {
    await this.commentService.deleteComment(slug, id);
  }
}
