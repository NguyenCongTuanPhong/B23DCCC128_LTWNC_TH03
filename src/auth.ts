import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { USERS } from '@/data/users';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials.email;
        const password = credentials.password;
        if (
          typeof email !== 'string' ||
          typeof password !== 'string'
        ) {
          return null;
        }

        const account = USERS.find(
          (candidate) =>
            candidate.email.toLowerCase() === email.toLowerCase() &&
            candidate.password === password,
        );

        if (!account) {
          return null;
        }

        return {
          id: account.id,
          name: account.name,
          email: account.email,
          role: account.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (
        typeof token.id !== 'string' ||
        (token.role !== 'student' && token.role !== 'admin')
      ) {
        throw new Error('Phiên đăng nhập thiếu thông tin định danh hoặc vai trò.');
      }

      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
        },
      };
    },
  },
});
