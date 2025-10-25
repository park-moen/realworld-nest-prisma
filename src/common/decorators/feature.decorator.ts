import { SetMetadata } from '@nestjs/common';

export const Feature = (name: string) => SetMetadata('feature', name);
