import './style.css';

import {
  getAvailableYears,
  getFinancialSummary,
  getMonthlyTotals,
} from './services/financialAnalytics';
import { TransactionManager } from './services/transactionManager';

import {
  loadTransactions,
  saveTransactions,
} from './services/transactionStorage';
import {
  allCategories,
  getCategoryLabel,
  isExpenseCategory,
  isIncomeCategory,
} from './types/category';
import type { TransactionFilters } from './types/transaction';
import { getElement } from './ui/helpers';
import { renderDashboard, renderYearOptions } from './ui/renderDashboard';
import { renderTransactions } from './ui/renderTransactions';
import type { ValidatedTransactionData } from './ui/transactionForm';
import {
  openAddForm,
  openEditForm,
  setupTransactionForm,
} from './ui/transactionForm';

const addButton = getElement<HTMLButtonElement>('#add-transaction-button');
const searchInput = getElement<HTMLInputElement>('#search-input');
const typeFilter = getElement<HTMLSelectElement>('#type-filter');
const categoryFilter = getElement<HTMLSelectElement>('#category-filter');
const yearSelect = getElement<HTMLSelectElement>('#chart-year');
const feedbackElement = getElement('#transaction-feedback');
const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav-link');

const transactionManager = new TransactionManager(loadTransactions());

const filters: TransactionFilters = {
  searchText: '',
  type: 'all',
  category: 'all',
};

const currentYear = new Date().getFullYear();
let chartYear = currentYear;
let feedbackTimer: number | undefined;

function createId(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

function showFeedback(message: string, isError: boolean): void {
  feedbackElement.textContent = message;
  feedbackElement.classList.toggle('feedback-error', isError);

  window.clearTimeout(feedbackTimer);
  feedbackTimer = window.setTimeout(() => {
    feedbackElement.textContent = '';
  }, 3500);
}

function renderDashboardSection(): void {
  const allTransactions = transactionManager.getAll();
  const years = getAvailableYears(allTransactions, currentYear);

  if (!years.includes(chartYear)) chartYear = currentYear;

  const summary = getFinancialSummary(allTransactions);
  const monthlyTotals = getMonthlyTotals(allTransactions, chartYear);

  renderYearOptions(years, chartYear);
  renderDashboard(summary, monthlyTotals, chartYear);
}

function renderTransactionList(): void {
  const visibleTransactions = transactionManager.getFiltered(filters);
  const totalCount = transactionManager.getAll().length;

  renderTransactions(visibleTransactions, totalCount, handleEdit, handleDelete);
}

function renderApp(): void {
  renderDashboardSection();
  renderTransactionList();
}

function saveAndRender(successMessage: string): void {
  try {
    saveTransactions(transactionManager.getAll());
    showFeedback(successMessage, false);
  } catch (error) {
    console.error(error);
    showFeedback('Your changes could not be saved in this browser.', true);
  }

  renderApp();
}

function handleSave(
  data: ValidatedTransactionData,
  editingId: string | null,
): string | null {
  try {
    if (editingId === null) {
      transactionManager.add({
        ...data,
        id: createId(),
        createdAt: new Date().toISOString(),
      });
    } else {
      const existingTransaction = transactionManager.findById(editingId);

      if (existingTransaction === undefined) {
        return 'This transaction no longer exists.';
      }

      transactionManager.update({
        ...data,
        id: existingTransaction.id,
        createdAt: existingTransaction.createdAt,
      });
    }
  } catch (error) {
    console.error(error);
    return 'Could not save this transaction. Please try again.';
  }

  chartYear = Number(data.date.slice(0, 4));

  if (editingId === null) {
    saveAndRender('Transaction added.');
  } else {
    saveAndRender('Transaction updated.');
  }

  return null;
}

function handleEdit(id: string): void {
  const transaction = transactionManager.findById(id);

  if (transaction === undefined) return;

  openEditForm(transaction);
}

function handleDelete(id: string): void {
  const transaction = transactionManager.findById(id);

  if (transaction === undefined) return;

  const confirmed = window.confirm(`Delete "${transaction.title}"?`);

  if (!confirmed) return;

  transactionManager.delete(id);
  saveAndRender('Transaction deleted.');
}

function readTypeFilter(): TransactionFilters['type'] {
  const value = typeFilter.value;

  if (value === 'income' || value === 'expense') return value;

  return 'all';
}

function readCategoryFilter(): TransactionFilters['category'] {
  const value = categoryFilter.value;

  if (isIncomeCategory(value)) return value;
  if (isExpenseCategory(value)) return value;

  return 'all';
}

function setupCategoryFilter(): void {
  categoryFilter.append(new Option('All categories', 'all'));

  for (const category of allCategories) {
    categoryFilter.append(new Option(getCategoryLabel(category), category));
  }
}

function setupFilters(): void {
  setupCategoryFilter();

  searchInput.addEventListener('input', () => {
    filters.searchText = searchInput.value;
    renderTransactionList();
  });

  typeFilter.addEventListener('change', () => {
    filters.type = readTypeFilter();
    renderTransactionList();
  });

  categoryFilter.addEventListener('change', () => {
    filters.category = readCategoryFilter();
    renderTransactionList();
  });
}

function setupNavigation(): void {
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.forEach((otherLink) => otherLink.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

function startApp(): void {
  setupFilters();
  setupNavigation();
  setupTransactionForm(handleSave);

  addButton.addEventListener('click', openAddForm);

  yearSelect.addEventListener('change', () => {
    chartYear = Number(yearSelect.value);
    renderDashboardSection();
  });

  renderApp();
}

startApp();
