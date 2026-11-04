import type { Transaction, TransactionFilters } from '../types/transaction';

export class TransactionManager {
  private transactions: Transaction[];

  constructor(initialTransactions: Transaction[] = []) {
    this.transactions = [...initialTransactions];
  }

  add(newTransaction: Transaction): void {
    const alreadyExists = this.transactions.some(
      (transaction) => transaction.id === newTransaction.id,
    );

    if (alreadyExists) throw new Error('Transaction already exists.');

    this.transactions = [...this.transactions, newTransaction];
  }

  getAll(): Transaction[] {
    return [...this.transactions];
  }

  getFiltered(filters: TransactionFilters): Transaction[] {
    const searchText = filters.searchText.trim().toLowerCase();

    const matches = this.transactions.filter((transaction) => {
      const matchesSearch = transaction.title
        .toLowerCase()
        .includes(searchText);
      const matchesType =
        filters.type === 'all' || transaction.type === filters.type;
      const matchesCategory =
        filters.category === 'all' || transaction.category === filters.category;

      return matchesSearch && matchesType && matchesCategory;
    });

    return matches.sort((first, second) => {
      if (first.date !== second.date) {
        return second.date.localeCompare(first.date);
      }

      return second.createdAt.localeCompare(first.createdAt);
    });
  }

  findById(id: string): Transaction | undefined {
    return this.transactions.find((transaction) => transaction.id === id);
  }

  update(updatedTransaction: Transaction): void {
    const exists = this.transactions.some(
      (transaction) => transaction.id === updatedTransaction.id,
    );

    if (!exists) throw new Error('Transaction not found.');

    this.transactions = this.transactions.map((transaction) => {
      if (transaction.id === updatedTransaction.id) return updatedTransaction;

      return transaction;
    });
  }

  delete(id: string): void {
    this.transactions = this.transactions.filter(
      (transaction) => transaction.id !== id,
    );
  }
}
