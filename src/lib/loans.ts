import { db } from '@/lib/db';
import { can } from '@/lib/permissions';
import type { Loan, LoanData, LoanStatus, Role } from '@/types';

export interface LoanViewer {
  email: string;
  role: Role;
}

export type LoanListItem = Loan & { bookTitle: string };

export interface LoanPage {
  items: LoanListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export function parseStatus(value: unknown): LoanStatus | undefined {
  return value === 'pending' || value === 'approved' || value === 'rejected'
    ? value
    : undefined;
}

export function listLoans(
  viewer: LoanViewer,
  status: LoanStatus | undefined,
  requestedPage: number,
): LoanPage {
  const mayReview = can(viewer.role, 'loan:review');
  const mayCreate = can(viewer.role, 'loan:create');
  const visibleLoans = db.loans
    .filter((loan) => mayReview || (mayCreate && loan.userEmail === viewer.email))
    .filter((loan) => !status || loan.status === status)
    .sort((left, right) => right.id - left.id);
  const total = visibleLoans.length;
  const totalPages = Math.max(1, Math.ceil(total / 10));
  const page = Number.isFinite(requestedPage)
    ? Math.min(totalPages, Math.max(1, Math.floor(requestedPage)))
    : 1;
  const items = visibleLoans
    .slice((page - 1) * 10, page * 10)
    .map((loan) => ({
      ...loan,
      bookTitle:
        db.books.find((book) => book.id === loan.bookId)?.title ??
        'Sách không còn trong danh mục',
    }));

  return { items, total, page, totalPages };
}

export function allLoans(): LoanListItem[] {
  return db.loans
    .slice()
    .sort((left, right) => right.id - left.id)
    .map((loan) => ({
      ...loan,
      bookTitle:
        db.books.find((book) => book.id === loan.bookId)?.title ??
        'Sách không còn trong danh mục',
    }));
}

export type SubmitLoanResult =
  | { ok: true; loan: Loan }
  | { ok: false; message: string };

export function submitLoan(email: string, data: LoanData): SubmitLoanResult {
  const book = db.books.find((item) => item.id === data.bookId);
  if (!book) {
    return { ok: false, message: 'Hãy chọn sách' };
  }

  const reservedCopies = db.loans
    .filter(
      (loan) =>
        loan.bookId === data.bookId &&
        loan.pickupDate === data.pickupDate &&
        loan.status !== 'rejected',
    )
    .reduce((total, loan) => total + loan.quantity, 0);

  if (reservedCopies + data.quantity > book.copies) {
    return { ok: false, message: 'Sách đã hết bản vào ngày này' };
  }

  const loan: Loan = {
    id: db.nextLoanId,
    bookId: data.bookId,
    userEmail: email,
    pickupDate: data.pickupDate,
    term: data.term,
    quantity: data.quantity,
    reason: data.reason,
    status: 'pending',
  };
  db.nextLoanId += 1;
  db.loans.unshift(loan);
  return { ok: true, loan: { ...loan } };
}

export type CancelLoanResult = 'not-found' | 'forbidden' | 'not-pending' | 'ok';

export function cancelLoan(email: string, id: number): CancelLoanResult {
  const index = db.loans.findIndex((loan) => loan.id === id);
  if (index < 0) {
    return 'not-found';
  }

  const loan = db.loans[index];
  if (loan.userEmail !== email) {
    return 'forbidden';
  }
  if (loan.status !== 'pending') {
    return 'not-pending';
  }

  db.loans.splice(index, 1);
  return 'ok';
}

export function reviewLoanRequest(
  id: number,
  status: Extract<LoanStatus, 'approved' | 'rejected'>,
): boolean {
  const loan = db.loans.find((item) => item.id === id);
  if (!loan || loan.status !== 'pending') {
    return false;
  }

  loan.status = status;
  return true;
}
