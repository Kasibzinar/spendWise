import type { ExpenseCategory } from '../types/category';
import type { Transaction } from '../types/transaction';

export type CategorySpending = Partial<Record<ExpenseCategory, number>>;

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
  categorySpending: CategorySpending;
}

export interface MonthlyTotal {
  month: string;
  income: number;
  expenses: number;
}

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function getIncomes(transactions: Transaction[]): Transaction[] {
  return transactions.filter((transaction) => transaction.type === 'income');
}

function getExpenses(transactions: Transaction[]): Transaction[] {
  return transactions.filter((transaction) => transaction.type === 'expense');
}

function addAmounts(transactions: Transaction[]): number {
  return transactions.reduce((sum, transaction) => {
    return sum + transaction.amount;
  }, 0);
}

export function getTotalIncome(transactions: Transaction[]): number {
  return addAmounts(getIncomes(transactions));
}

export function getTotalExpenses(transactions: Transaction[]): number {
  return addAmounts(getExpenses(transactions));
}

export function getBalance(transactions: Transaction[]): number {
  return getTotalIncome(transactions) - getTotalExpenses(transactions);
}

export function getExpenseSpendingByCategory(
  transactions: Transaction[],
): CategorySpending {
  return getExpenses(transactions).reduce<CategorySpending>(
    (result, transaction) => {
      if (transaction.type === 'expense') {
        const currentAmount = result[transaction.category] ?? 0;

        result[transaction.category] = currentAmount + transaction.amount;
      }

      return result;
    },
    {},
  );
}

export function getMonthlyTotals(
  transactions: Transaction[],
  year: number,
): MonthlyTotal[] {
  return monthNames.map((monthName, monthIndex) => {
    const monthTransactions = transactions.filter((transaction) => {
      const transactionYear = Number(transaction.date.slice(0, 4));
      const transactionMonth = Number(transaction.date.slice(5, 7));

      return transactionYear === year && transactionMonth === monthIndex + 1;
    });

    return {
      month: monthName,
      income: getTotalIncome(monthTransactions),
      expenses: getTotalExpenses(monthTransactions),
    };
  });
}

export function getAvailableYears(
  transactions: Transaction[],
  currentYear: number,
): number[] {
  const years = [currentYear];

  for (const transaction of transactions) {
    const year = Number(transaction.date.slice(0, 4));

    if (!years.includes(year)) years.push(year);
  }

  return years.sort((first, second) => second - first);
}

export function getFinancialSummary(
  transactions: Transaction[],
): FinancialSummary {
  return {
    totalIncome: getTotalIncome(transactions),
    totalExpenses: getTotalExpenses(transactions),
    balance: getBalance(transactions),
    incomeCount: getIncomes(transactions).length,
    expenseCount: getExpenses(transactions).length,
    categorySpending: getExpenseSpendingByCategory(transactions),
  };
}
