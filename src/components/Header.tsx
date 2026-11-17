'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();
  const role = session?.user.role;

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Thư viện CNTT, trang chủ">
          <span className="brand-mark" aria-hidden="true">T</span>
          <span className="brand-copy">
            <strong>THƯ VIỆN CNTT</strong>
            <span>Tri thức cho tương lai số</span>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Điều hướng chính">
          <Link href="/books">Kho sách</Link>
          {role === 'student' && <Link href="/loans">Sách của tôi</Link>}
          {role === 'admin' && <Link href="/admin">Quản trị</Link>}
        </nav>
        <div className="header-account">
          {status === 'authenticated' ? (
            <>
              <span className="account-name">{session.user.name}</span>
              <button
                className="button button-outline button-small"
                onClick={() => signOut({ redirectTo: '/' })}
                type="button"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link className="button button-dark button-small" href="/login">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
