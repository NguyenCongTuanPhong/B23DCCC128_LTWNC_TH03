'use server';

import { auth } from '@/auth';
import { loadBooksShift } from '@/lib/books';
import { toLoanData, toLoanInput, validateLoan } from '@/lib/loan-validate';
import { cancelLoan, submitLoan } from '@/lib/loans';
import { can } from '@/lib/permissions';
import type { LoanFormState } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createLoanAction(
  _previousState: LoanFormState,
  formData: FormData,
): Promise<LoanFormState> {
  const session = await auth();
  if (!session?.user?.id || !can(session.user.role, 'loan:create')) {
    throw new Error('Không có quyền');
  }
  if (!session.user.email) {
    throw new Error('Tài khoản chưa có địa chỉ email.');
  }

  const input = toLoanInput(formData);
  const errors = validateLoan(input, loadBooksShift());
  if (Object.keys(errors).length > 0) {
    return { errors, values: input };
  }

  const result = submitLoan(session.user.email, toLoanData(input));
  if (!result.ok) {
    return { errors: {}, values: input, message: result.message };
  }

  revalidatePath('/loans');
  return {
    errors: {},
    values: {},
    message: 'Đã gửi yêu cầu, chờ duyệt',
    ok: true,
  };
}

export async function cancelLoanAction(
  id: number,
  _formData: FormData,
): Promise<void> {
  void _formData;
  const session = await auth();
  if (!session?.user?.id || !can(session.user.role, 'loan:create')) {
    throw new Error('Không có quyền');
  }
  if (!session.user.email) {
    throw new Error('Tài khoản chưa có địa chỉ email.');
  }

  cancelLoan(session.user.email, id);
  revalidatePath('/loans');
}
