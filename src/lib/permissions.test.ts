import { describe, expect, it } from 'vitest';
import { can } from '@/lib/permissions';

describe('quyền truy cập theo vai trò', () => {
  it('cho phép khách chỉ xem sách', () => {
    expect(can('guest', 'book:view')).toBe(true);
    expect(can('guest', 'loan:create')).toBe(false);
    expect(can(undefined, 'loan:review')).toBe(false);
  });

  it('cho phép sinh viên tạo yêu cầu nhưng không duyệt', () => {
    expect(can('student', 'book:view')).toBe(true);
    expect(can('student', 'loan:create')).toBe(true);
    expect(can('student', 'loan:review')).toBe(false);
  });

  it('cho phép admin duyệt nhưng không tạo yêu cầu', () => {
    expect(can('admin', 'book:view')).toBe(true);
    expect(can('admin', 'loan:create')).toBe(false);
    expect(can('admin', 'loan:review')).toBe(true);
  });
});
