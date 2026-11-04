import { getCategoryLabel } from '../types/category';
import type { Transaction } from '../types/transaction';
import { formatCurrency, formatDate, getElement } from './helpers';

type TransactionAction = (id: string) => void;

function createCell(text: string): HTMLTableCellElement {
  const cell = document.createElement('td');
  cell.textContent = text;

  return cell;
}

function createTitleCell(transaction: Transaction): HTMLTableCellElement {
  const cell = document.createElement('td');

  const wrapper = document.createElement('div');
  wrapper.className = 'transaction-name';

  const icon = document.createElement('span');
  icon.className = `transaction-icon ${transaction.type}-transaction`;
  icon.textContent = transaction.type === 'income' ? '+' : '-';

  const textBox = document.createElement('span');

  const title = document.createElement('strong');
  title.textContent = transaction.title;
  textBox.append(title);

  if (transaction.note !== undefined) {
    const note = document.createElement('small');
    note.textContent = transaction.note;
    textBox.append(note);
  }

  wrapper.append(icon, textBox);
  cell.append(wrapper);

  return cell;
}

function createCategoryCell(transaction: Transaction): HTMLTableCellElement {
  const cell = document.createElement('td');

  const tag = document.createElement('span');
  tag.className = 'category-tag';
  tag.textContent = getCategoryLabel(transaction.category);

  cell.append(tag);

  return cell;
}

function createAmountCell(transaction: Transaction): HTMLTableCellElement {
  const sign = transaction.type === 'income' ? '+' : '-';
  const cell = createCell(`${sign}${formatCurrency(transaction.amount)}`);

  cell.className = `amount-cell ${transaction.type}-amount`;

  return cell;
}

function createTypeCell(transaction: Transaction): HTMLTableCellElement {
  const cell = document.createElement('td');

  const indicator = document.createElement('span');
  indicator.className = `type-indicator ${transaction.type}-indicator`;
  indicator.textContent = transaction.type === 'income' ? 'Income' : 'Expense';

  cell.append(indicator);

  return cell;
}

function createActionButton(
  text: string,
  label: string,
  className: string,
  onClick: () => void,
): HTMLButtonElement {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = `row-button ${className}`;
  button.textContent = text;
  button.setAttribute('aria-label', label);
  button.addEventListener('click', onClick);

  return button;
}

function createActionsCell(
  transaction: Transaction,
  onEdit: TransactionAction,
  onDelete: TransactionAction,
): HTMLTableCellElement {
  const cell = document.createElement('td');

  const actions = document.createElement('div');
  actions.className = 'row-actions';

  actions.append(
    createActionButton(
      'Edit',
      `Edit ${transaction.title}`,
      'row-button-edit',
      () => onEdit(transaction.id),
    ),
    createActionButton(
      'Delete',
      `Delete ${transaction.title}`,
      'row-button-delete',
      () => onDelete(transaction.id),
    ),
  );

  cell.append(actions);

  return cell;
}

function createRow(
  transaction: Transaction,
  onEdit: TransactionAction,
  onDelete: TransactionAction,
): HTMLTableRowElement {
  const row = document.createElement('tr');

  const dateCell = createCell(formatDate(transaction.date));
  dateCell.className = 'date-cell';

  row.append(
    createTitleCell(transaction),
    createCategoryCell(transaction),
    dateCell,
    createAmountCell(transaction),
    createTypeCell(transaction),
    createActionsCell(transaction, onEdit, onDelete),
  );

  return row;
}

export function renderTransactions(
  visibleTransactions: Transaction[],
  totalCount: number,
  onEdit: TransactionAction,
  onDelete: TransactionAction,
): void {
  const tableBody = getElement('#transaction-list');
  const tableScroll = getElement('#table-scroll');
  const emptyState = getElement('#transaction-empty');
  const emptyTitle = getElement('#transaction-empty-title');
  const emptyText = getElement('#transaction-empty-text');
  const tableFooter = getElement('#table-footer');

  tableBody.replaceChildren();

  for (const transaction of visibleTransactions) {
    tableBody.append(createRow(transaction, onEdit, onDelete));
  }

  const hasRows = visibleTransactions.length > 0;

  tableScroll.hidden = !hasRows;
  emptyState.hidden = hasRows;
  tableFooter.hidden = totalCount === 0;

  if (totalCount === 0) {
    emptyTitle.textContent = 'No transactions yet';
    emptyText.textContent =
      'Click "Add transaction" to record your first income or expense.';
  } else {
    emptyTitle.textContent = 'No matching transactions';
    emptyText.textContent = 'Try a different search or change the filters.';
  }

  getElement('#table-count').textContent =
    `Showing ${visibleTransactions.length} of ${totalCount} transactions`;
}
