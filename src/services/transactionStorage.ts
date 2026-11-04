import { isExpenseCategory, isIncomeCategory } from '../types/category';
import type { Transaction } from '../types/transaction';
import { isValidDate } from '../types/transaction';

const STORAGE_KEY = 'spendwise_transactions';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function isTransaction(value: unknown): value is Transaction {
  if (!isRecord(value)) return false;

  if (!isNonEmptyString(value.id) || !isNonEmptyString(value.title)) {
    return false;
  }

  if (
    typeof value.amount !== 'number' ||
    !Number.isFinite(value.amount) ||
    value.amount <= 0
  ) {
    return false;
  }

  if (typeof value.date !== 'string' || !isValidDate(value.date)) return false;

  if (
    typeof value.createdAt !== 'string' ||
    Number.isNaN(Date.parse(value.createdAt))
  ) {
    return false;
  }

  if ('note' in value && typeof value.note !== 'string') return false;

  if (value.type === 'income') return isIncomeCategory(value.category);

  if (value.type === 'expense') return isExpenseCategory(value.category);

  return false;
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    const jsonData = JSON.stringify(transactions);

    localStorage.setItem(STORAGE_KEY, jsonData);
  } catch (error) {
    console.error('Failed to save transactions:', error);

    throw new Error('Your transactions could not be saved in this browser.');
  }
}

export function loadTransactions(): Transaction[] {
  let savedData: string | null;

  try {
    savedData = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to access localStorage:', error);
    return [];
  }

  if (savedData === null) return [];

  try {
    const parsedData: unknown = JSON.parse(savedData);

    if (!Array.isArray(parsedData)) {
      console.error('Saved transaction data is not a list.');
      return [];
    }

    const validTransactions = parsedData.filter(isTransaction);

    if (validTransactions.length !== parsedData.length) {
      console.warn('Some saved transactions were invalid and were skipped.');
    }

    return validTransactions;
  } catch (error) {
    console.error('Saved transaction data is not valid JSON:', error);
    return [];
  }
}
