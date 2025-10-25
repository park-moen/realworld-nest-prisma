import { Module } from '@nestjs/common';
import { FeatureFlagService } from './service/feature-flag.service';

@Module({
  providers: [FeatureFlagService],
})
export class FeatureFlagModule {}
