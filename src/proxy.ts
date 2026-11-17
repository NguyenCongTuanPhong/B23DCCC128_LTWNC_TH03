import { auth } from '@/auth';
import { can } from '@/lib/permissions';
import { NextResponse } from 'next/server';

export default auth((request) => {
  const role = request.auth?.user.role;
  const pathname = request.nextUrl.pathname;

  if (
    !request.auth ||
    (!can(role, 'loan:create') && !can(role, 'loan:review'))
  ) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith('/admin') && !can(role, 'loan:review')) {
    return NextResponse.redirect(new URL('/loans?error=forbidden', request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/loans/:path*', '/admin/:path*'],
};
