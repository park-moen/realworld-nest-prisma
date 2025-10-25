import { FeatureFlagService } from '@app/core/feature-flag/service/feature-flag.service';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  private readonly logger = new Logger(FeatureFlagGuard.name);
  constructor(
    private readonly reflector: Reflector,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const featureName = this.reflector.get<string>(
      'feature',
      context.getHandler(),
    );

    if (!featureName) {
      return true;
    }

    const isEnabled = this.featureFlagService.isFeatureEnabled(featureName);

    if (!isEnabled) {
      throw new HttpException(
        'Feature not implemented',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    return true;
  }
}
