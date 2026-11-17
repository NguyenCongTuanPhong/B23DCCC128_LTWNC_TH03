import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { updateLoanStatusAction } from '@/app/(app)/admin/actions';
import { USERS } from '@/data/users';
import { allLoans } from '@/lib/loans';
import { can } from '@/lib/permissions';
import { formatDate, STATUS_LABEL, TERM_LABEL } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Quản lý mượn sách',
  description: 'Quản lý và xét duyệt yêu cầu mượn sách của sinh viên.',
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=%2Fadmin');
  }
  if (!can(session.user.role, 'loan:review')) {
    redirect('/loans');
  }

  const loans = allLoans();
  const pendingCount = loans.filter((loan) => loan.status === 'pending').length;

  return (
    <div className="page-container">
      <section className="page-intro admin-intro">
        <span className="eyebrow">KHÔNG GIAN THỦ THƯ</span>
        <h1>Quản lý<br /><span>yêu cầu mượn.</span></h1>
        <p>Kiểm tra tình trạng đăng ký và xét duyệt yêu cầu.</p>
        <div className="admin-summary">
          <strong>{pendingCount}</strong>
          <span>yêu cầu đang chờ xét duyệt</span>
        </div>
      </section>

      <section className="admin-list" aria-label="Danh sách yêu cầu mượn">
        <div className="admin-list-heading">
          <h2>Tất cả yêu cầu</h2>
          <span>{loans.length} yêu cầu</span>
        </div>
        <div className="admin-requests">
          {loans.map((loan) => (
            <article className="request-card" key={loan.id}>
              <div className="request-main">
                <span className={`status-pill status-${loan.status}`}>
                  {STATUS_LABEL[loan.status]}
                </span>
                <h3>{loan.bookTitle}</h3>
                <p>
                  {USERS.find((user) => user.email === loan.userEmail)?.name ?? loan.userEmail}
                  {' · '}{loan.userEmail}
                </p>
              </div>
              <div className="request-date">
                <span>{TERM_LABEL[loan.term]} · {loan.quantity} quyển</span>
                <strong>{formatDate(loan.pickupDate)}</strong>
              </div>
              <p className="request-reason">{loan.reason}</p>
              {loan.status === 'pending' && (
                <div className="request-actions">
                  <form action={updateLoanStatusAction.bind(null, loan.id, 'approved')}>
                    <button className="button button-dark button-small" type="submit">Duyệt</button>
                  </form>
                  <form action={updateLoanStatusAction.bind(null, loan.id, 'rejected')}>
                    <button className="button button-outline button-small" type="submit">Từ chối</button>
                  </form>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
