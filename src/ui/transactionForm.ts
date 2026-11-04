import type { ExpenseCategory, IncomeCategory } from '../types/category';
import {
  expenseCategories,
  getCategoryLabel,
  incomeCategories,
  isExpenseCategory,
  isIncomeCategory,
} from '../types/category';
import type { Transaction } from '../types/transaction';
import { isValidDate } from '../types/transaction';
import { getElement } from './helpers';

export type ValidatedTransactionData =
  | {
      type: 'income';
      title: string;
      amount: number;
      category: IncomeCategory;
      date: string;
      note?: string;
    }
  | {
      type: 'expense';
      title: string;
      amount: number;
      category: ExpenseCategory;
      date: string;
      note?: string;
    };

type ValidationResult =
  | { success: true; data: ValidatedTransactionData }
  | { success: false; errors: string[] };

interface FormValues {
  type: string;
  title: string;
  amount: string;
  category: string;
  date: string;
  note: string;
}

type SaveHandler = (
  data: ValidatedTransactionData,
  editingId: string | null,
) => string | null;

const dialog = getElement<HTMLDialogElement>('#transaction-dialog');
const form = getElement<HTMLFormElement>('#transaction-form');
const formTitle = getElement('#form-title');
const closeButton = getElement<HTMLButtonElement>('#close-transaction-dialog');
const cancelButton = getElement<HTMLButtonElement>(
  '#cancel-transaction-button',
);
const saveButton = getElement<HTMLButtonElement>('#save-transaction-button');
const errorList = getElement('#transaction-errors');

const typeSelect = getElement<HTMLSelectElement>('#transaction-type');
const titleInput = getElement<HTMLInputElement>('#transaction-title');
const amountInput = getElement<HTMLInputElement>('#transaction-amount');
const categorySelect = getElement<HTMLSelectElement>('#transaction-category');
const dateInput = getElement<HTMLInputElement>('#transaction-date');
const noteInput = getElement<HTMLTextAreaElement>('#transaction-note');

let editingId: string | null = null;

function getTodayText(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${today.getFullYear()}-${month}-${day}`;
}

function showErrors(messages: string[]): void {
  errorList.replaceChildren();

  for (const message of messages) {
    const item = document.createElement('li');
    item.textContent = message;
    errorList.append(item);
  }
}

function fillCategoryOptions(type: string): void {
  categorySelect.replaceChildren();

  if (type === 'income') {
    categorySelect.append(new Option('Select category', ''));

    for (const category of incomeCategories) {
      categorySelect.append(new Option(getCategoryLabel(category), category));
    }
  } else if (type === 'expense') {
    categorySelect.append(new Option('Select category', ''));

    for (const category of expenseCategories) {
      categorySelect.append(new Option(getCategoryLabel(category), category));
    }
  } else {
    categorySelect.append(new Option('Select a type first', ''));
  }
}

function readFormValues(): FormValues {
  return {
    type: typeSelect.value,
    title: titleInput.value,
    amount: amountInput.value,
    category: categorySelect.value,
    date: dateInput.value,
    note: noteInput.value,
  };
}

function validateTransaction(values: FormValues): ValidationResult {
  const errors: string[] = [];

  const title = values.title.trim();
  const amountText = values.amount.trim();
  const note = values.note.trim();
  const amount = Math.round(Number(amountText) * 100) / 100;

  if (title === '') {
    errors.push('Title is required.');
  }

  if (amountText === '') {
    errors.push('Amount is required.');
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.push('Amount must be a valid positive number.');
  }

  if (values.type === 'income') {
    if (!isIncomeCategory(values.category)) {
      errors.push('Please select an income category.');
    }
  } else if (values.type === 'expense') {
    if (!isExpenseCategory(values.category)) {
      errors.push('Please select an expense category.');
    }
  } else {
    errors.push('Please select a transaction type.');
  }

  if (!isValidDate(values.date)) {
    errors.push('Please enter a valid date.');
  }

  if (errors.length > 0) return { success: false, errors };

  let data: ValidatedTransactionData;

  if (values.type === 'income' && isIncomeCategory(values.category)) {
    data = {
      type: 'income',
      title,
      amount,
      category: values.category,
      date: values.date,
    };
  } else if (values.type === 'expense' && isExpenseCategory(values.category)) {
    data = {
      type: 'expense',
      title,
      amount,
      category: values.category,
      date: values.date,
    };
  } else {
    return { success: false, errors: ['Please check the form and try again.'] };
  }

  if (note !== '') data.note = note;

  return { success: true, data };
}

export function openAddForm(): void {
  editingId = null;

  form.reset();
  fillCategoryOptions('');
  dateInput.value = getTodayText();
  showErrors([]);

  formTitle.textContent = 'Add Transaction';
  saveButton.textContent = 'Save transaction';

  dialog.showModal();
}

export function openEditForm(transaction: Transaction): void {
  editingId = transaction.id;

  form.reset();
  typeSelect.value = transaction.type;
  fillCategoryOptions(transaction.type);
  categorySelect.value = transaction.category;
  titleInput.value = transaction.title;
  amountInput.value = String(transaction.amount);
  dateInput.value = transaction.date;
  noteInput.value = transaction.note ?? '';
  showErrors([]);

  formTitle.textContent = 'Edit Transaction';
  saveButton.textContent = 'Save changes';

  dialog.showModal();
}

export function setupTransactionForm(onSave: SaveHandler): void {
  typeSelect.addEventListener('change', () => {
    fillCategoryOptions(typeSelect.value);
  });

  closeButton.addEventListener('click', () => dialog.close());
  cancelButton.addEventListener('click', () => dialog.close());

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const result = validateTransaction(readFormValues());

    if (result.success === false) {
      showErrors(result.errors);
      return;
    }

    const errorMessage = onSave(result.data, editingId);

    if (errorMessage !== null) {
      showErrors([errorMessage]);
      return;
    }

    dialog.close();
  });
}
