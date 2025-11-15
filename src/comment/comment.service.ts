import { Injectable, Logger } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { CreateCommentDto } from './dto/request/create-comment.dto';
import { ArticleService } from '@app/article/article.service';
import { ICommentCreatePayload } from './comment.type';
import { ProfileService } from '@app/profile/profile.service';
import { Comment } from './entity/comment.entity';
import { CommentDto } from './dto/response/comment.response.dto';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly articleService: ArticleService,
    private readonly profileService: ProfileService,
  ) {}

  async createComment(
    slug: string,
    userId: string,
    { body }: CreateCommentDto,
  ): Promise<CommentDto> {
    const article = await this.articleService.findArticleBySlug(slug);
    const commentCreatePayload: ICommentCreatePayload = {
      authorId: userId,
      articleId: article.id,
      body,
    };
    const comment = await this.commentRepository.create(commentCreatePayload);

    return this.buildCommentResponse(comment);
  }

  private async buildCommentResponse(comment: Comment): Promise<CommentDto> {
    const author = await this.profileService.getProfile(
      comment.author.username,
    );

    return {
      id: comment.id,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      body: comment.body,
      author,
    };
  }
}
