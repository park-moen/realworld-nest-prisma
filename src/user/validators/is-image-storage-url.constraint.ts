// src/user/validators/is-image-storage-url.constraint.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsImageStorageUrl', async: false })
@Injectable()
export class IsImageStorageUrlConstraint
  implements ValidatorConstraintInterface
{
  private readonly allowed: string[];

  constructor(private readonly config: ConfigService) {
    this.allowed = (config.get<string>('ALLOWED_IMAGE_BASE') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  validate(value: any) {
    if (value == null || value === '') return true;
    if (typeof value !== 'string') return false;

    try {
      const u = new URL(value);
      let ok: boolean;
      if (this.allowed.length > 0) {
        ok = this.allowed.some(
          (host) => u.host === host || u.host.endsWith(`.${host}`),
        );
      } else {
        ok = /\.amazonaws\.com$/i.test(u.host);
      }

      return ok;
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid storage URL`;
  }
}
