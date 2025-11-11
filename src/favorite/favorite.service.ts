import { Injectable, Logger } from '@nestjs/common';
import { FavoriteRepository } from './favorite.repository';
import {
  FavoriteAlreadyExistsError,
  FavoriteNotFoundError,
} from '@app/common/errors/favorite-domain.error';

@Injectable()
export class FavoriteService {
  private readonly logger = new Logger(FavoriteService.name);
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  async addFavorite(articleId: string, userId: string): Promise<void> {
    const favorite = await this.favoriteRepository.create(articleId, userId);

    if (!favorite) {
      throw new FavoriteNotFoundError();
    }
  }

  async validationIsFavorite(articleId: string, userId: string): Promise<void> {
    const isFavorite = await this.favoriteRepository.exists(articleId, userId);

    if (isFavorite) {
      throw new FavoriteAlreadyExistsError(articleId, userId);
    }
  }
}
