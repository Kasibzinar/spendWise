export type IncomeCategory =
  | 'salary'
  | 'freelance'
  | 'business'
  | 'gift'
  | 'other';

export type ExpenseCategory =
  | 'food'
  | 'transportation'
  | 'education'
  | 'shopping'
  | 'healthcare'
  | 'entertainment'
  | 'other';

export type TransactionCategory = IncomeCategory | ExpenseCategory;

export const incomeCategories: IncomeCategory[] = [
  'salary',
  'freelance',
  'business',
  'gift',
  'other',
];

export const expenseCategories: ExpenseCategory[] = [
  'food',
  'transportation',
  'education',
  'shopping',
  'healthcare',
  'entertainment',
  'other',
];

export const allCategories: TransactionCategory[] = [
  ...incomeCategories.filter((category) => category !== 'other'),
  ...expenseCategories.filter((category) => category !== 'other'),
  'other',
];

export function isIncomeCategory(value: unknown): value is IncomeCategory {
  return incomeCategories.some((category) => category === value);
}

export function isExpenseCategory(value: unknown): value is ExpenseCategory {
  return expenseCategories.some((category) => category === value);
}

export function getCategoryLabel(category: TransactionCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
