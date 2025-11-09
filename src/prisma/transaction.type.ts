import { Prisma } from '@prisma/client';

export type PrismaTransaction = Omit<
  Prisma.TransactionClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

export type TransactionCallback<T> = (tx: PrismaTransaction) => Promise<T>;
