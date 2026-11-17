import { describe, expect, it } from 'vitest';
import { CATEGORIES, generateBooks, generateLoans, TERMS } from '@/data/books';
import { USERS } from '@/data/users';

describe('dữ liệu mẫu thư viện', () => {
  it('tạo cố định 24 sách, mỗi danh mục có 6 sách và 1 đến 4 bản', () => {
    const books = generateBooks(24);
    expect(books).toEqual(generateBooks(24));
    expect(books).toHaveLength(24);
    expect(CATEGORIES.map((category) =>
      books.filter((book) => book.category === category).length,
    )).toEqual([6, 6, 6, 6]);
    expect(books.every((book) => book.copies >= 1 && book.copies <= 4)).toBe(true);
    expect(books[0]).toMatchObject({ title: 'Lập trình C căn bản', copies: 1 });
    expect(books[5]).toMatchObject({ title: 'An toàn mạng', category: 'Mạng máy tính', copies: 1 });
    expect(books[2]).toMatchObject({ title: 'Nhập môn cơ sở dữ liệu', copies: 3 });
    expect(books[10]).toMatchObject({ title: 'Thiết kế cơ sở dữ liệu', copies: 1 });
  });

  it('tạo 37 yêu cầu với đúng số lượng trạng thái và tài khoản', () => {
    const loans = generateLoans(37);
    expect(loans.filter((loan) => loan.status === 'pending')).toHaveLength(13);
    expect(loans.filter((loan) => loan.status === 'approved')).toHaveLength(12);
    expect(loans.filter((loan) => loan.status === 'rejected')).toHaveLength(12);
    expect(loans.filter((loan) => loan.userEmail === 'sv01@ptit.edu.vn')).toHaveLength(27);
    expect(loans.filter((loan) => loan.userEmail === 'sv02@ptit.edu.vn')).toHaveLength(10);
    expect(TERMS).toEqual([7, 14, 30]);
  });

  it('cung cấp đủ ba tài khoản mẫu đúng vai trò', () => {
    expect(USERS.map(({ email, password, role }) => ({ email, password, role }))).toEqual([
      { email: 'sv01@ptit.edu.vn', password: 'sv123456', role: 'student' },
      { email: 'sv02@ptit.edu.vn', password: 'sv123456', role: 'student' },
      { email: 'admin@ptit.edu.vn', password: 'admin123', role: 'admin' },
    ]);
  });
});
