import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);
  constructor() {}
}
