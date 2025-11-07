import {
  Injectable,
  Logger,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  private readonly logger = new Logger(CustomValidationPipe.name);

  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: false,
      exceptionFactory: (validationErrors: ValidationError[]) => {
        const errors = validationErrors.map((error) => {
          this.logger.log('error', JSON.stringify(error));

          return {
            field: error.property,
            message:
              Object.values(error.constraints || {})[0] || 'Validation failed',
            constraints: Object.keys(error.constraints),
          };
        });

        return new UnprocessableEntityException({
          code: 'VALIDATION.INVALID_INPUT',
          message: 'Validation failed',
          details: errors,
        });
      },
    });
  }
}
