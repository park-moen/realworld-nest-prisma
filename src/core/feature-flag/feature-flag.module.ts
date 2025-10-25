import { Global, Module } from '@nestjs/common';
import { FeatureFlagService } from './service/feature-flag.service';

@Global()
@Module({
  providers: [FeatureFlagService],
  exports: [FeatureFlagService],
})
export class FeatureFlagModule {}
