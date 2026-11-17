import type { Role } from '../types';

export type UserRole = Role;

export type LibraryUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
