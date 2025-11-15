import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CommentRepository {
  private readonly logger = new Logger(CommentRepository.name);
  constructor() {}
}
