import { beforeEach, describe, expect, it } from 'vitest';
import { generateBooks, generateLoans } from '@/data/books';
import { db } from '@/lib/db';
import {
  cancelLoan,
  listLoans,
  parseStatus,
  submitLoan,
} from '@/lib/loans';
import type { LoanData } from '@/types';

function resetDb(): void {
  db.books.splice(0, db.books.length, ...generateBooks(24));
  db.loans.splice(0, db.loans.length, ...generateLoans(37));
  db.nextLoanId = 38;
}

function loanData(overrides: Partial<LoanData> = {}): LoanData {
  return {
    bookId: 11,
    pickupDate: '2026-12-03',
    term: 14,
    quantity: 1,
    reason: 'Mượn sách phục vụ môn học',
    ...overrides,
  };
}

describe('nghiệp vụ yêu cầu mượn', () => {
  beforeEach(resetDb);

  it('chia 27 yêu cầu của sv01 thành ba trang 10, 10 và 7', () => {
    const viewer = { email: 'sv01@ptit.edu.vn', role: 'student' as const };
    const pages = [1, 2, 3].map((page) => listLoans(viewer, undefined, page));
    expect(pages.map((page) => page.items.length)).toEqual([10, 10, 7]);
    expect(pages[0].total).toBe(27);
    expect(pages[0].totalPages).toBe(3);
  });

  it('cho admin xem 37 yêu cầu và kẹp trang ngoài giới hạn', () => {
    const viewer = { email: 'admin@ptit.edu.vn', role: 'admin' as const };
    const lastPage = listLoans(viewer, undefined, 99);
    expect(listLoans(viewer, undefined, 1).total).toBe(37);
    expect(lastPage.page).toBe(4);
    expect(lastPage.items).toHaveLength(7);
    expect(listLoans(viewer, undefined, 0).page).toBe(1);
  });

  it('lọc trạng thái và chỉ trả yêu cầu của đúng sinh viên', () => {
    const viewer = { email: 'sv01@ptit.edu.vn', role: 'student' as const };
    const pending = listLoans(viewer, 'pending', 1);
    expect(pending.total).toBe(9);
    expect(pending.items.every((loan) => loan.userEmail === viewer.email)).toBe(true);
  });

  it('chỉ nhận ba trạng thái hợp lệ', () => {
    expect(parseStatus('pending')).toBe('pending');
    expect(parseStatus('approved')).toBe('approved');
    expect(parseStatus('rejected')).toBe('rejected');
    expect(parseStatus('cancelled')).toBeUndefined();
    expect(parseStatus('')).toBeUndefined();
  });

  it('từ chối sách id 6 đã có yêu cầu duyệt vào ngày 02/12/2026', () => {
    expect(submitLoan('sv01@ptit.edu.vn', loanData({
      bookId: 6,
      pickupDate: '2026-12-02',
    }))).toEqual({
      ok: false,
      message: 'Sách đã hết bản vào ngày này',
    });
  });

  it('bỏ qua yêu cầu mẫu bị từ chối và thêm yêu cầu mới lên đầu danh sách', () => {
    const result = submitLoan('sv01@ptit.edu.vn', loanData());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.loan).toMatchObject({ id: 38, bookId: 11, status: 'pending' });
      expect(db.loans[0].id).toBe(38);
    }
  });

  it('trả đúng các trạng thái khi hủy: không có, không phải của mình, không chờ duyệt', () => {
    expect(cancelLoan('sv01@ptit.edu.vn', 999)).toBe('not-found');
    expect(cancelLoan('sv01@ptit.edu.vn', 1)).toBe('forbidden');
    expect(cancelLoan('sv01@ptit.edu.vn', 2)).toBe('not-pending');
  });

  it('xóa yêu cầu đang chờ của chính người dùng', () => {
    const result = submitLoan('sv01@ptit.edu.vn', loanData({
      bookId: 3,
      pickupDate: '2027-01-03',
    }));
    if (!result.ok) {
      throw new Error(result.message);
    }

    expect(cancelLoan('sv01@ptit.edu.vn', result.loan.id)).toBe('ok');
    expect(db.loans.some((loan) => loan.id === result.loan.id)).toBe(false);
  });
});
