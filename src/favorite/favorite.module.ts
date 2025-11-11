import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteRepository } from './favorite.repository';
import { PrismaModule } from '@app/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FavoriteService, FavoriteRepository],
  exports: [FavoriteService],
})
export class FavoriteModule {}
