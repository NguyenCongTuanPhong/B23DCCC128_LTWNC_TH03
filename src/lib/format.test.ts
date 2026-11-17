import { describe, expect, it } from 'vitest';
import { formatDate, STATUS_LABEL, TERM_LABEL } from '@/lib/format';

describe('định dạng thông tin yêu cầu mượn', () => {
  it('định dạng ngày, thời hạn và trạng thái bằng tiếng Việt', () => {
    expect(formatDate('2026-12-02')).toBe('02/12/2026');
    expect(TERM_LABEL[14]).toBe('14 ngày');
    expect(STATUS_LABEL.pending).toBe('Chờ duyệt');
  });
});
