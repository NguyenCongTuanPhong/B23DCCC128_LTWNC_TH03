import { describe, expect, it } from 'vitest';
import { generateBooks } from '@/data/books';
import {
  today,
  toLoanData,
  toLoanInput,
  validateLoan,
} from '@/lib/loan-validate';
import type { LoanInput } from '@/types';

const books = generateBooks(24);

function futureDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString().slice(0, 10);
}

function validInput(overrides: Partial<LoanInput> = {}): LoanInput {
  return {
    bookId: '1',
    pickupDate: futureDate(),
    term: '14',
    quantity: '1',
    reason: 'Phục vụ học phần lập trình',
    ...overrides,
  };
}

describe('chuyển đổi và kiểm tra dữ liệu mượn', () => {
  it('đổi FormData thành chuỗi và điền chuỗi rỗng cho trường thiếu', () => {
    const formData = new FormData();
    formData.set('bookId', '6');
    expect(toLoanInput(formData)).toEqual({
      bookId: '6',
      pickupDate: '',
      term: '',
      quantity: '',
      reason: '',
    });
  });

  it('trả object lỗi rỗng khi dữ liệu hợp lệ', () => {
    expect(validateLoan(validInput(), books)).toEqual({});
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('báo đủ lỗi cho form chưa chọn sách, ngày, thời hạn và lý do', () => {
    expect(
      validateLoan(
        validInput({
          bookId: '',
          pickupDate: '',
          term: '',
          reason: '',
        }),
        books,
      ),
    ).toEqual({
      bookId: 'Hãy chọn sách',
      pickupDate: 'Hãy chọn ngày',
      term: 'Hãy chọn thời hạn',
      reason: 'Lý do tối thiểu 10 ký tự',
    });
  });

  it('từ chối ngày lấy sách ở quá khứ', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = yesterday.toISOString().slice(0, 10);
    expect(validateLoan(validInput({ pickupDate: date }), books).pickupDate)
      .toBe('Ngày lấy sách không được ở quá khứ');
  });

  it('từ chối lý do ngắn hoặc chỉ chứa khoảng trắng', () => {
    expect(validateLoan(validInput({ reason: 'Ngắn' }), books).reason)
      .toBe('Lý do tối thiểu 10 ký tự');
    expect(validateLoan(validInput({ reason: '          ' }), books).reason)
      .toBe('Lý do tối thiểu 10 ký tự');
  });

  it('từ chối số quyển vượt số bản của sách đã chọn', () => {
    expect(validateLoan(validInput({ quantity: '2' }), books).quantity)
      .toBe('Vượt số bản của sách (1 bản)');
  });

  it('chỉ chấp nhận số quyển nguyên dương', () => {
    expect(validateLoan(validInput({ quantity: '0' }), books).quantity)
      .toBe('Số quyển phải từ 1 trở lên');
    expect(validateLoan(validInput({ quantity: '1.5' }), books).quantity)
      .toBe('Số quyển phải từ 1 trở lên');
  });

  it('chỉ chấp nhận thời hạn 7, 14 hoặc 30 ngày', () => {
    expect(validateLoan(validInput({ term: '10' }), books).term)
      .toBe('Hãy chọn thời hạn');
  });

  it('ép chuỗi sang số và cắt khoảng trắng trong lý do', () => {
    expect(toLoanData(validInput({
      bookId: '6',
      quantity: '1',
      reason: '  Mượn để học môn mạng  ',
    }))).toEqual({
      bookId: 6,
      pickupDate: futureDate(),
      term: 14,
      quantity: 1,
      reason: 'Mượn để học môn mạng',
    });
  });
});
