import { CATEGORIES } from '@/data/books';
import { db } from '@/lib/db';
import type { Book } from '@/types';

export function loadBooksShift(): Book[] {
  return db.books.map((book) => ({ ...book }));
}

export function getBookById(id: string | number): Book | undefined {
  const numericId = typeof id === 'number' ? id : Number(id);
  if (!Number.isInteger(numericId)) {
    return undefined;
  }

  return db.books.find((book) => book.id === numericId);
}

export function getBookCategories(): string[] {
  return [...CATEGORIES];
}
