import { Injectable, Logger } from '@nestjs/common';
import { ArticleRepository } from './article.repository';
import { TagRepository } from '@app/tag/tag.repository';
import { TransactionService } from '@app/prisma/transaction.service';
import { IArticlePayload } from './article.type';
import { PrismaTransaction } from '@app/prisma/transaction.type';
import { ArticleToTagRepository } from '@app/articleToTag/articleToTag.repository';
import { Article } from './entity/article.entity';
import { TransactionExecutionError } from '@app/common/errors/system.error';

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
    articlePayload: IArticlePayload,
    tagNames: string[],
  ): Promise<Article> {
    const action = async (tx: PrismaTransaction) => {
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
}
