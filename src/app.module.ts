import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/prisma/prisma.module';
import { UserModule } from '@app/user/user.module';
import { AuthModule } from './auth/auth.module';
import { FeatureFlagModule } from './core/feature-flag/feature-flag.module';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { FeatureFlagGuard } from './common/guards/feature-flag.guard';
import { HealthModule } from './health/health.module';
import configuration from './config/configuration';
import { UnifiedExceptionFilter } from './common/filters/unified-exception.filter';
import { ArticleModule } from './article/article.module';
import { TagModule } from './tag/tag.module';
import { ArticleToTagModule } from './articleToTag/articleToTag.module';
import { CustomValidationPipe } from './common/pipe/custom-validation.pipe';
import { FavoriteModule } from './favorite/favorite.module';
import { ProfileModule } from './profile/profile.module';
import { CommentModule } from './comment/comment.module';

// ! Config 중앙 집중화에서 리펙토링
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 Loading env file:', `.env.${process.env.NODE_ENV || 'local'}`);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
      load: [configuration],
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    ProfileModule,
    ArticleModule,
    FeatureFlagModule,
    HealthModule,
    TagModule,
    CommentModule,
    ArticleToTagModule,
    FavoriteModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FeatureFlagGuard,
    },
    {
      provide: APP_FILTER,
      useClass: UnifiedExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
  ],
})
export class AppModule {}
