// src/user/validators/is-image-storage-url.ts
import { Validate } from 'class-validator';
import { IsImageStorageUrlConstraint } from './is-image-storage-url.constraint';

export function IsImageStorageUrl() {
  return Validate(IsImageStorageUrlConstraint);
}
