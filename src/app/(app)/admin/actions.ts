'use server';

import { auth } from '@/auth';
import { reviewLoanRequest } from '@/lib/loans';
import { can } from '@/lib/permissions';
import type { LoanStatus } from '@/types';
import { revalidatePath } from 'next/cache';

export async function updateLoanStatusAction(
  id: number,
  status: Extract<LoanStatus, 'approved' | 'rejected'>,
  _formData: FormData,
): Promise<void> {
  void _formData;
  const session = await auth();
  if (!session?.user?.id || !can(session.user.role, 'loan:review')) {
    throw new Error('Không có quyền');
  }
  if (status !== 'approved' && status !== 'rejected') {
    throw new Error('Trạng thái xét duyệt không hợp lệ.');
  }
  if (!reviewLoanRequest(id, status)) {
    throw new Error('Yêu cầu không tồn tại hoặc đã được xử lý.');
  }

  revalidatePath('/admin');
  revalidatePath('/loans');
}
