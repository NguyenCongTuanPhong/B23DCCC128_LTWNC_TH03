import { TERMS } from '@/data/books';
import type { Book, LoanData, LoanErrors, LoanInput, Term } from '@/types';

export interface LoanValidation {
  errors: LoanErrors;
  values: Partial<LoanInput>;
}

function isFormData(raw: unknown): raw is FormData {
  return typeof FormData !== 'undefined' && raw instanceof FormData;
}

function isRecord(raw: unknown): raw is Record<string, unknown> {
  return typeof raw === 'object' && raw !== null;
}

function readField(raw: unknown, key: keyof LoanInput): string {
  if (isFormData(raw)) {
    const value = raw.get(key);
    return typeof value === 'string' ? value : '';
  }

  if (!isRecord(raw)) {
    return '';
  }

  const value = raw[key];
  return typeof value === 'string' ? value : '';
}

export function toLoanInput(raw: unknown): LoanInput {
  return {
    bookId: readField(raw, 'bookId'),
    pickupDate: readField(raw, 'pickupDate'),
    term: readField(raw, 'term'),
    quantity: readField(raw, 'quantity'),
    reason: readField(raw, 'reason'),
  };
}

export function today(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function validateLoan(
  input: LoanInput,
  books: Book[],
): LoanErrors {
  const errors: LoanErrors = {};
  const book = books.find((item) => String(item.id) === input.bookId);

  if (!book) {
    errors.bookId = 'Hãy chọn sách';
  }

  if (!input.pickupDate) {
    errors.pickupDate = 'Hãy chọn ngày';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(input.pickupDate)) {
    errors.pickupDate = 'Hãy chọn ngày';
  } else {
    const parsedDate = new Date(`${input.pickupDate}T00:00:00.000Z`);
    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== input.pickupDate
    ) {
      errors.pickupDate = 'Hãy chọn ngày';
    } else if (input.pickupDate < today()) {
      errors.pickupDate = 'Ngày lấy sách không được ở quá khứ';
    }
  }

  if (!TERMS.some((term) => String(term) === input.term)) {
    errors.term = 'Hãy chọn thời hạn';
  }

  const quantity = Number(input.quantity);
  if (!/^\d+$/.test(input.quantity) || !Number.isInteger(quantity) || quantity < 1) {
    errors.quantity = 'Số quyển phải từ 1 trở lên';
  } else if (book && quantity > book.copies) {
    errors.quantity = `Vượt số bản của sách (${book.copies} bản)`;
  }

  if (input.reason.trim().length < 10) {
    errors.reason = 'Lý do tối thiểu 10 ký tự';
  }

  return errors;
}

export function toLoanData(input: LoanInput): LoanData {
  let term: Term;
  if (input.term === '7') {
    term = 7;
  } else if (input.term === '14') {
    term = 14;
  } else if (input.term === '30') {
    term = 30;
  } else {
    throw new Error('Thời hạn mượn không hợp lệ.');
  }

  return {
    bookId: Number(input.bookId),
    pickupDate: input.pickupDate,
    term,
    quantity: Number(input.quantity),
    reason: input.reason.trim(),
  };
}

export const getTodayInVietnam = today;
