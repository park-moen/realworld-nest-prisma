import { Injectable, Logger } from '@nestjs/common';
import { ArticleRepository } from './article.repository';
import { TagRepository } from '@app/tag/tag.repository';
import { TransactionService } from '@app/prisma/transaction.service';
import { IArticlePayload } from './article.type';
import { PrismaTransaction } from '@app/prisma/transaction.type';
import { ArticleToTagRepository } from '@app/articleToTag/articleToTag.repository';

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
  ): Promise<void> {
    const action = async (tx: PrismaTransaction) => {
      await this.tagRepository.createTagByList(tagNames, tx);

      const tagList = await this.tagRepository.findTagListByTagNames(
        tagNames,
        tx,
      );
      const article = await this.articleRepository.create(articlePayload, tx);

      await this.articleToTagRepository.createArticleToTag(
        article.id,
        tagList,
        tx,
      );
    };

    await this.transactionService.start(action);
  }
}
