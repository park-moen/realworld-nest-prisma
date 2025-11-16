import { Injectable, Logger } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { CreateCommentDto } from './dto/request/create-comment.dto';
import { ArticleService } from '@app/article/article.service';
import { ICommentCreatePayload } from './comment.type';
import { ProfileService } from '@app/profile/profile.service';
import { Comment } from './entity/comment.entity';
import { CommentDto } from './dto/response/comment.response.dto';
import {
  CommentAuthorMismatchError,
  CommentNotFoundError,
} from '@app/common/errors/comment-domain.error';

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
    const article = await this.articleService.ensureArticleExistsBySlug(slug);
    const commentCreatePayload: ICommentCreatePayload = {
      authorId: userId,
      articleId: article.id,
      body,
    };
    const comment = await this.commentRepository.create(commentCreatePayload);

    return this.buildCommentResponse(comment);
  }

  async getComments(slug: string, userId: string): Promise<CommentDto[]> {
    const article = await this.articleService.ensureArticleExistsBySlug(slug);

    const comments = await this.commentRepository.findManyByArticleId(
      article.id,
    );

    return Promise.all(
      comments.map((comment) => this.buildCommentResponse(comment, userId)),
    );
  }

  async deleteComment(
    slug: string,
    commentId: string,
    userId: string,
  ): Promise<void> {
    await this.articleService.ensureArticleExistsBySlug(slug);
    const comment = await this.commentRepository.findByCommentId(commentId);

    if (!comment) {
      throw new CommentNotFoundError();
    }

    if (comment.authorId !== userId) {
      throw new CommentAuthorMismatchError();
    }

    await this.commentRepository.delete(commentId);
  }

  private async buildCommentResponse(
    comment: Comment,
    userId?: string,
  ): Promise<CommentDto> {
    const author = await this.profileService.getProfile(
      comment.author.username,
      userId,
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
