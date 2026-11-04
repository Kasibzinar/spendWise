import type { Transaction } from './transaction';

export interface ITransactionManager {
  add(transaction: Transaction): void;

  getAll(): Transaction[];

  findById(id: string): Transaction | undefined;

  update(transaction: Transaction): void;

  delete(id: string): void;
}
