import { Injectable, Logger } from '@nestjs/common';
import { ArticleRepository } from './article.repository';
import { TagRepository } from '@app/tag/tag.repository';
import { TransactionService } from '@app/prisma/transaction.service';
import { IArticlePayload } from './article.type';
import { PrismaTransaction } from '@app/prisma/transaction.type';
import { ArticleToTagRepository } from '@app/articleToTag/articleToTag.repository';
import { Article } from './entity/article.entity';
import { TransactionExecutionError } from '@app/common/errors/system.error';
import {
  ArticleNotFoundError,
  SlugAlreadyExistsError,
} from '@app/common/errors/article-domain.error';

@Injectable()
export class ArticleTransaction {
  private readonly logger = new Logger(ArticleTransaction.name);
  constructor(
    private readonly transactionService: TransactionService,
    private readonly articleRepository: ArticleRepository,
    private readonly tagRepository: TagRepository,
    private readonly articleToTagRepository: ArticleToTagRepository,
  ) {}

  // ! transaction이 정확히 동작하는지 확인하기 위해 임의의 Error를 발생시키는 payload를 하드코딩으로 만들어서 테스트
  async createArticleTransaction(
    // ! createPayload라는 점을 부각하기 위해 articleCreatePayload로 변경 예정
    articlePayload: IArticlePayload,
    tagNames: string[],
  ): Promise<Article> {
    const action = async (tx: PrismaTransaction): Promise<Article> => {
      const article = await this.articleRepository.create(articlePayload, tx);

      if (tagNames.length > 0) {
        await this.tagRepository.createTagByList(tagNames, tx);
        const tagList = await this.tagRepository.findTagListByTagNames(
          tagNames,
          tx,
        );
        await this.articleToTagRepository.createArticleToTag(
          article.id,
          tagList,
          tx,
        );
      }

      const articleWithRelations =
        await this.articleRepository.findByIdWithRelations(article.id, tx);

      if (!articleWithRelations) {
        this.logger.error('Critical: Article not found after creation', {
          articleId: article.id,
          payload: articlePayload,
        });

        throw new TransactionExecutionError( // ✅ System Error
          'Critical: Article not found after creation',
          {
            articleId: article.id,
            operation: 'createArticle',
          },
        );
      }

      return articleWithRelations;
    };

    return await this.transactionService.start<Article>(action);
  }

  async updateArticleTransaction(
    articleId: string,
    articleUpdatePayload: Partial<IArticlePayload>,
    newTagNames?: string[],
  ): Promise<Article> {
    const action = async (tx: PrismaTransaction): Promise<Article> => {
      const existingArticle = await this.articleRepository.findById(
        articleId,
        tx,
      );

      if (!existingArticle) {
        throw new ArticleNotFoundError();
      }

      if (articleUpdatePayload.slug) {
        const articleWithSameSlug = await this.articleRepository.findBySlug(
          articleUpdatePayload.slug,
          tx,
        );

        if (articleWithSameSlug && articleWithSameSlug.id !== articleId) {
          throw new SlugAlreadyExistsError(articleUpdatePayload.slug);
        }
      }

      if (Object.keys(articleUpdatePayload).length > 0) {
        await this.articleRepository.update(
          articleId,
          articleUpdatePayload,
          tx,
        );
      }

      if (newTagNames !== undefined) {
        await this.articleToTagRepository.deleteArticleToTAg(articleId, tx);

        if (newTagNames.length > 0) {
          await this.tagRepository.createTagByList(newTagNames, tx);
          const tagList = await this.tagRepository.findTagListByTagNames(
            newTagNames,
            tx,
          );
          await this.articleToTagRepository.createArticleToTag(
            articleId,
            tagList,
            tx,
          );
        }
      }

      const updatedArticle = await this.articleRepository.findByIdWithRelations(
        articleId,
        tx,
      );

      if (!updatedArticle) {
        this.logger.error('Critical: Article not found after update', {
          articleId,
        });

        throw new TransactionExecutionError(
          'Failed to retrieve updated article',
          {
            articleId,
            operation: 'updateArticle',
          },
        );
      }

      return updatedArticle;
    };

    return await this.transactionService.start(action);
  }
}
