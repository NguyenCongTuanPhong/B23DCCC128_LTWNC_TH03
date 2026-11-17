'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false,
        redirectTo: callbackUrl,
      });

      if (result?.error) {
        setError('Email hoặc mật khẩu chưa chính xác.');
        return;
      }

      window.location.assign(callbackUrl);
    } catch {
      setError('Đăng nhập chưa thành công. Vui lòng thử lại.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="login-form" action={handleSubmit}>
      <label>
        <span>Email sinh viên</span>
        <input
          autoComplete="email"
          name="email"
          placeholder="ban@cntt.edu.vn"
          required
          type="email"
        />
      </label>
      <label>
        <span>Mật khẩu</span>
        <input
          autoComplete="current-password"
          name="password"
          placeholder="Nhập mật khẩu"
          required
          type="password"
        />
      </label>
      {error && <p className="form-message form-error" role="alert">{error}</p>}
      <button className="button button-dark button-full" disabled={pending} type="submit">
        {pending ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  );
}
