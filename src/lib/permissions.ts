import type { Role } from '@/types';

export type Permission = 'book:view' | 'loan:create' | 'loan:review';
export type ViewerRole = Role | 'guest' | null | undefined;

export function can(role: ViewerRole, permission: Permission): boolean {
  if (permission === 'book:view') {
    return true;
  }

  if (role === 'student') {
    return permission === 'loan:create';
  }

  if (role === 'admin') {
    return permission === 'loan:review';
  }

  return false;
}
