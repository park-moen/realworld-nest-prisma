import { Controller, Logger } from '@nestjs/common';

@Controller('articles/:slug/comments')
export class CommentController {
  private readonly logger = new Logger(CommentController.name);
  constructor() {}
}
