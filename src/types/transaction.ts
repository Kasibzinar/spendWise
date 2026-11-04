import type {
  ExpenseCategory,
  IncomeCategory,
  TransactionCategory,
} from './category';

export type TransactionType = 'income' | 'expense';

interface BaseTransaction {
  readonly id: string;

  title: string;
  amount: number;
  date: string;

  note?: string;

  readonly createdAt: string;
}

export interface IncomeTransaction extends BaseTransaction {
  type: 'income';
  category: IncomeCategory;
}

export interface ExpenseTransaction extends BaseTransaction {
  type: 'expense';
  category: ExpenseCategory;
}

export type Transaction = IncomeTransaction | ExpenseTransaction;

export interface TransactionFilters {
  searchText: string;
  type: 'all' | TransactionType;
  category: 'all' | TransactionCategory;
}

export function isValidDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (match === null) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
