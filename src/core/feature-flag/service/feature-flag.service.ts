import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FeatureFlagService {
  constructor(private readonly configService: ConfigService) {}

  isFeatureEnabled(featureName: string): boolean {
    const key = `FF_${featureName.toUpperCase().replace(/-/g, '_')}`;
    const value = this.configService.get<string | undefined>(key);

    if (value === undefined || value === null) {
      return false;
    }

    return ['true', '1', 'on'].includes(value.toLowerCase().trim());
  }
}
