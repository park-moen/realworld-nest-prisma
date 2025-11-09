import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TransactionCallback } from './transaction.type';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async start<T>(callback: TransactionCallback<T>): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      return await callback(tx);
    });
  }
}
