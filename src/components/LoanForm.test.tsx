import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { generateBooks } from '@/data/books';
import LoanForm from '@/components/LoanForm';
import type { LoanFormState } from '@/types';

const books = generateBooks(24);

function createAction(result: LoanFormState) {
  return vi.fn(
    async (
      _previousState: LoanFormState,
      _formData: FormData,
    ): Promise<LoanFormState> => {
      void _previousState;
      void _formData;
      return result;
    },
  );
}

describe('biểu mẫu mượn sách', () => {
  it('hiện lỗi dưới đúng các trường sau khi gửi form trống', async () => {
    const user = userEvent.setup();
    const action = createAction({
      errors: { bookId: 'Hãy chọn sách', reason: 'Lý do tối thiểu 10 ký tự' },
      values: { bookId: '', quantity: '1', reason: '' },
    });
    render(<LoanForm action={action} books={books} />);

    await user.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));

    expect(await screen.findByText('Hãy chọn sách')).toHaveAttribute('role', 'alert');
    expect(screen.getByText('Lý do tối thiểu 10 ký tự')).toHaveAttribute('role', 'alert');
  });

  it('gửi đúng bookId, term, quantity và các trường đã nhập', async () => {
    const user = userEvent.setup();
    const action = createAction({ errors: {}, values: {}, message: 'Đã gửi yêu cầu, chờ duyệt', ok: true });
    render(<LoanForm action={action} books={books} />);

    await user.selectOptions(screen.getByLabelText('Sách'), '1');
    await user.type(screen.getByLabelText('Ngày lấy sách'), '2026-12-20');
    await user.selectOptions(screen.getByLabelText('Thời hạn mượn'), '14');
    await user.clear(screen.getByLabelText('Số quyển'));
    await user.type(screen.getByLabelText('Số quyển'), '1');
    await user.type(screen.getByLabelText('Lý do mượn'), 'Mượn để học môn lập trình');
    await user.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Đã gửi yêu cầu, chờ duyệt');
    expect(action).toHaveBeenCalledOnce();
    const formData = action.mock.calls[0][1];
    expect(formData.get('bookId')).toBe('1');
    expect(formData.get('term')).toBe('14');
    expect(formData.get('quantity')).toBe('1');
  });

  it('giữ lại lý do khi sách đã hết bản', async () => {
    const user = userEvent.setup();
    const action = createAction({
      errors: {},
      values: {
        bookId: '6',
        pickupDate: '2026-12-02',
        term: '14',
        quantity: '1',
        reason: 'Mượn phục vụ môn học',
      },
      message: 'Sách đã hết bản vào ngày này',
    });
    render(<LoanForm action={action} books={books} />);

    await user.selectOptions(screen.getByLabelText('Sách'), '6');
    await user.type(screen.getByLabelText('Ngày lấy sách'), '2026-12-02');
    await user.selectOptions(screen.getByLabelText('Thời hạn mượn'), '14');
    await user.type(screen.getByLabelText('Lý do mượn'), 'Mượn phục vụ môn học');
    await user.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Sách đã hết bản vào ngày này');
    expect(screen.getByLabelText('Lý do mượn')).toHaveValue('Mượn phục vụ môn học');
  });

  it('chọn sẵn sách theo defaultBookId', () => {
    const action = createAction({ errors: {}, values: {} });
    render(<LoanForm action={action} books={books} defaultBookId="6" />);

    expect(screen.getByLabelText('Sách')).toHaveValue('6');
  });
});
