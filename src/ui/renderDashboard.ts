import type { ExpenseCategory } from '../types/category';
import { expenseCategories, getCategoryLabel } from '../types/category';
import type {
  FinancialSummary,
  MonthlyTotal,
} from '../services/financialAnalytics';
import { formatCompactCurrency, formatCurrency, getElement } from './helpers';

interface CategoryRow {
  category: ExpenseCategory;
  amount: number;
  percent: number;
}

function formatCount(count: number, label: string): string {
  if (count === 1) return `1 ${label} transaction`;

  return `${count} ${label} transactions`;
}

function renderSummaryCards(summary: FinancialSummary): void {
  const totalCount = summary.incomeCount + summary.expenseCount;

  getElement('#balance-value').textContent = formatCurrency(summary.balance);
  getElement('#income-value').textContent = formatCurrency(summary.totalIncome);
  getElement('#expense-value').textContent = formatCurrency(
    summary.totalExpenses,
  );

  getElement('#balance-note').textContent = formatCount(totalCount, 'total');
  getElement('#income-note').textContent = formatCount(
    summary.incomeCount,
    'income',
  );
  getElement('#expense-note').textContent = formatCount(
    summary.expenseCount,
    'expense',
  );
}

function getHighestValue(monthlyTotals: MonthlyTotal[]): number {
  let highest = 0;

  for (const monthTotal of monthlyTotals) {
    highest = Math.max(highest, monthTotal.income, monthTotal.expenses);
  }

  return highest;
}

function getBarHeight(value: number, highestValue: number): number {
  if (value === 0 || highestValue === 0) return 0;

  return Math.max((value / highestValue) * 100, 3);
}

function createBar(
  className: string,
  label: string,
  value: number,
  highestValue: number,
): HTMLSpanElement {
  const bar = document.createElement('span');

  bar.className = `bar ${className}`;
  bar.style.height = `${getBarHeight(value, highestValue)}%`;
  bar.title = `${label}: ${formatCurrency(value)}`;

  return bar;
}

function createMonthGroup(
  monthTotal: MonthlyTotal,
  highestValue: number,
  isCurrentMonth: boolean,
): HTMLDivElement {
  const group = document.createElement('div');
  group.className = 'month-group';

  if (isCurrentMonth) group.classList.add('current-month');

  const barPair = document.createElement('div');
  barPair.className = 'bar-pair';
  barPair.append(
    createBar(
      'income-bar',
      `${monthTotal.month} income`,
      monthTotal.income,
      highestValue,
    ),
    createBar(
      'expense-bar',
      `${monthTotal.month} expenses`,
      monthTotal.expenses,
      highestValue,
    ),
  );

  const monthLabel = document.createElement('span');
  monthLabel.className = 'month-label';
  monthLabel.textContent = monthTotal.month;

  group.append(barPair, monthLabel);

  return group;
}

function renderMonthlyChart(
  monthlyTotals: MonthlyTotal[],
  chartYear: number,
): void {
  const yAxis = getElement('#chart-y-axis');
  const bars = getElement('#chart-bars');
  const note = getElement('#chart-note');
  const chart = getElement('#monthly-chart');

  const highestValue = getHighestValue(monthlyTotals);
  const today = new Date();

  let yearIncome = 0;
  let yearExpenses = 0;

  for (const monthTotal of monthlyTotals) {
    yearIncome += monthTotal.income;
    yearExpenses += monthTotal.expenses;
  }

  getElement('#chart-income-total').textContent = formatCurrency(yearIncome);
  getElement('#chart-expense-total').textContent = formatCurrency(yearExpenses);

  yAxis.replaceChildren();

  for (const ratio of [1, 0.75, 0.5, 0.25, 0]) {
    const label = document.createElement('span');
    label.textContent = formatCompactCurrency(highestValue * ratio);
    yAxis.append(label);
  }

  bars.replaceChildren();

  monthlyTotals.forEach((monthTotal, monthIndex) => {
    const isCurrentMonth =
      today.getFullYear() === chartYear && today.getMonth() === monthIndex;

    bars.append(createMonthGroup(monthTotal, highestValue, isCurrentMonth));
  });

  chart.setAttribute(
    'aria-label',
    `Monthly income and expenses for ${chartYear}`,
  );

  if (highestValue === 0) {
    note.textContent = `No transactions in ${chartYear} yet.`;
  } else {
    note.textContent = '';
  }
}

function getCategoryRows(summary: FinancialSummary): CategoryRow[] {
  const rows: CategoryRow[] = [];

  for (const category of expenseCategories) {
    const amount = summary.categorySpending[category] ?? 0;

    if (amount > 0) {
      rows.push({
        category,
        amount,
        percent: (amount / summary.totalExpenses) * 100,
      });
    }
  }

  return rows.sort((first, second) => second.amount - first.amount);
}

function formatPercent(percent: number): string {
  return `${Math.round(percent * 10) / 10}%`;
}

function createCategoryItem(row: CategoryRow): HTMLLIElement {
  const item = document.createElement('li');
  item.className = 'category-item';

  const name = document.createElement('span');
  name.className = 'category-name';

  const dot = document.createElement('i');
  dot.className = `category-dot category-${row.category}`;

  name.append(dot, getCategoryLabel(row.category));

  const amount = document.createElement('span');
  amount.className = 'category-amount';
  amount.textContent = formatCurrency(row.amount);

  const percent = document.createElement('span');
  percent.className = 'category-percent';
  percent.textContent = formatPercent(row.percent);

  item.append(name, amount, percent);

  return item;
}

function renderCategoryBreakdown(summary: FinancialSummary): void {
  const track = getElement('#category-breakdown');
  const list = getElement('#category-list');
  const rows = getCategoryRows(summary);

  getElement('#category-total-value').textContent = formatCurrency(
    summary.totalExpenses,
  );

  track.replaceChildren();
  list.replaceChildren();

  if (rows.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'category-empty';
    emptyItem.textContent = 'No expenses yet. Your spending will show up here.';
    list.append(emptyItem);
    return;
  }

  for (const row of rows) {
    const segment = document.createElement('span');
    segment.className = `breakdown-segment category-${row.category}`;
    segment.style.width = `${row.percent}%`;
    segment.title = `${getCategoryLabel(row.category)}: ${formatPercent(row.percent)}`;
    track.append(segment);

    list.append(createCategoryItem(row));
  }
}

export function renderYearOptions(years: number[], selectedYear: number): void {
  const yearSelect = getElement<HTMLSelectElement>('#chart-year');

  yearSelect.replaceChildren();

  for (const year of years) {
    yearSelect.append(new Option(String(year), String(year)));
  }

  yearSelect.value = String(selectedYear);
}

export function renderDashboard(
  summary: FinancialSummary,
  monthlyTotals: MonthlyTotal[],
  chartYear: number,
): void {
  renderSummaryCards(summary);
  renderMonthlyChart(monthlyTotals, chartYear);
  renderCategoryBreakdown(summary);
}
