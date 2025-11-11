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
    try {
      await this.favoriteRepository.create(articleId, userId);
    } catch (error) {
      if ((error.code = 'P2002')) {
        throw new FavoriteAlreadyExistsError(articleId, userId);
      }

      throw error;
    }
  }

  async deleteFavorite(articleId: string, userId: string): Promise<void> {
    try {
      await this.favoriteRepository.delete(articleId, userId);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new FavoriteNotFoundError();
      }

      throw error;
    }
  }
}
