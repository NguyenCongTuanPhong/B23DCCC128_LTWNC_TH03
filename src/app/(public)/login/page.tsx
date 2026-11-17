import type { Metadata } from 'next';
import Link from 'next/link';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập tài khoản sinh viên hoặc thủ thư.',
};

type SearchParams = Promise<{
  callbackUrl?: string | string[];
  error?: string | string[];
}>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const requestedUrl = Array.isArray(params.callbackUrl)
    ? params.callbackUrl[0]
    : params.callbackUrl;
  const callbackUrl =
    requestedUrl?.startsWith('/') &&
    !requestedUrl.startsWith('//') &&
    !requestedUrl.includes('\\')
      ? requestedUrl
      : '/loans';

  return (
    <div className="login-layout">
      <section className="login-aside">
        <span className="eyebrow eyebrow-light">THƯ VIỆN KHOA CNTT</span>
        <h1>Một thế giới<br />tri thức đang<br /><em>chờ bạn.</em></h1>
        <p>Đăng nhập để gửi yêu cầu mượn sách và theo dõi lịch nhận tại thư viện.</p>
        <Link className="text-link link-light" href="/books">Khám phá kho sách <span aria-hidden="true">↗</span></Link>
      </section>
      <section className="login-panel">
        <span className="eyebrow">CHÀO MỪNG TRỞ LẠI</span>
        <h2>Đăng nhập</h2>
        <p>Sử dụng tài khoản thư viện của bạn để tiếp tục.</p>
        {params.error && <p className="form-message form-error">Bạn chưa có quyền truy cập trang này.</p>}
        <LoginForm callbackUrl={callbackUrl} />
        <div className="login-help">
          <strong>Tài khoản demo</strong>
          <span>Sinh viên 1: sv01@ptit.edu.vn / sv123456</span>
          <span>Sinh viên 2: sv02@ptit.edu.vn / sv123456</span>
          <span>Thủ thư: admin@ptit.edu.vn / admin123</span>
        </div>
      </section>
    </div>
  );
}
