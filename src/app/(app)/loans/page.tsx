import type { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/auth';
import { cancelLoanAction, createLoanAction } from '@/app/(app)/loans/actions';
import LoanForm from '@/components/LoanForm';
import { loadBooksShift } from '@/lib/books';
import { formatDate, STATUS_LABEL, TERM_LABEL } from '@/lib/format';
import { listLoans, parseStatus } from '@/lib/loans';
import { can } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Sách đã mượn',
  description: 'Theo dõi, lọc và gửi yêu cầu mượn sách.',
};

type SearchParams = Promise<{
  error?: string | string[];
  status?: string | string[];
  page?: string | string[];
  book?: string | string[];
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function paginationHref(
  page: number,
  status: string | undefined,
  book: string | undefined,
): string {
  const query = new URLSearchParams({ page: String(page) });
  if (status) {
    query.set('status', status);
  }
  if (book) {
    query.set('book', book);
  }
  return `/loans?${query.toString()}`;
}

export default async function LoansPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const rawStatus = firstValue(params.status);
  const status = parseStatus(rawStatus);
  const requestedPage = Number(firstValue(params.page) ?? '1');
  const defaultBookId = firstValue(params.book);
  const error = firstValue(params.error);
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=%2Floans');
  }
  if (!session.user.email) {
    throw new Error('Tài khoản chưa có địa chỉ email.');
  }

  const viewer = { email: session.user.email, role: session.user.role };
  const result = listLoans(viewer, status, requestedPage);
  const books = loadBooksShift();
  const isStudent = can(viewer.role, 'loan:create');
  const previous = paginationHref(result.page - 1, status, defaultBookId);
  const next = paginationHref(result.page + 1, status, defaultBookId);

  return (
    <div className="page-container">
      <section className="page-intro loans-intro">
        <span className="eyebrow">THEO DÕI ĐĂNG KÝ</span>
        <h1>Sách đã<br /><span>mượn.</span></h1>
        <p>Tra cứu yêu cầu, tình trạng duyệt và lịch lấy sách.</p>
      </section>
      {error === 'forbidden' && (
        <p className="form-message form-error" role="alert">
          Bạn không có quyền truy cập trang quản trị.
        </p>
      )}

      <section className="admin-list" aria-label="Danh sách yêu cầu mượn">
        <div className="admin-list-heading">
          <h2>Yêu cầu mượn</h2>
          <span>{result.total} yêu cầu</span>
        </div>
        <form action="/loans" className="loan-filter" method="get">
          <label htmlFor="status">Trạng thái</label>
          <select defaultValue={status ?? ''} id="status" name="status">
            <option value="">Tất cả</option>
            <option value="pending">{STATUS_LABEL.pending}</option>
            <option value="approved">{STATUS_LABEL.approved}</option>
            <option value="rejected">{STATUS_LABEL.rejected}</option>
          </select>
          <button className="button button-outline button-small" type="submit">Lọc</button>
        </form>

        {result.items.length === 0 ? (
          <div className="empty-state compact-empty">
            <h2>Chưa có yêu cầu mượn sách</h2>
            <p>Chọn sách trong danh mục rồi gửi yêu cầu mượn.</p>
          </div>
        ) : (
          <div className="loan-table-wrap">
            <table className="loan-table">
              <thead>
                <tr>
                  <th>Sách</th>
                  <th>Ngày lấy</th>
                  <th>Thời hạn</th>
                  <th>Số quyển</th>
                  <th>Trạng thái</th>
                  {isStudent && <th>Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {result.items.map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.bookTitle}</td>
                    <td>{formatDate(loan.pickupDate)}</td>
                    <td>{TERM_LABEL[loan.term]}</td>
                    <td>{loan.quantity}</td>
                    <td>
                      <span className={`status-pill status-${loan.status}`}>
                        {STATUS_LABEL[loan.status]}
                      </span>
                    </td>
                    {isStudent && (
                      <td>
                        {loan.status === 'pending' ? (
                          <form action={cancelLoanAction.bind(null, loan.id)}>
                            <button className="button button-outline button-small" type="submit">
                              Hủy
                            </button>
                          </form>
                        ) : '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <nav className="loan-pagination" aria-label="Phân trang yêu cầu mượn">
          {result.page > 1
            ? <Link href={previous}>Trước</Link>
            : <span>Trước</span>}
          <span>Trang {result.page}/{result.totalPages}</span>
          {result.page < result.totalPages
            ? <Link href={next}>Sau</Link>
            : <span>Sau</span>}
        </nav>
      </section>

      {isStudent && (
        <aside className="loan-form-panel">
          <span className="eyebrow">ĐĂNG KÝ MƯỢN</span>
          <h2>Gửi yêu cầu<br />mượn sách.</h2>
          <LoanForm
            action={createLoanAction}
            books={books}
            defaultBookId={defaultBookId}
          />
        </aside>
      )}
    </div>
  );
}
