import Link from 'next/link';
import type { Book } from '@/types/book';

const coverStyles: Record<string, string> = {
  'Lập trình': 'cover-coral',
  'Cơ sở dữ liệu': 'cover-blue',
  'Toán rời rạc': 'cover-green',
  'Mạng máy tính': 'cover-violet',
};

export default function BookCard({ book }: { book: Book }) {
  return (
    <article className="book-card">
      <Link
        className={`book-cover ${coverStyles[book.category] ?? 'cover-blue'}`}
        href={`/books/${book.id}`}
        aria-label={`Xem sách ${book.title}`}
      >
        <span className="cover-kicker">CNTT · THƯ VIỆN</span>
        <span className="cover-title">{book.title}</span>
        <span className="cover-author">{book.author}</span>
        <span className="cover-edition">MÃ SÁCH {book.id}</span>
      </Link>
      <div className="book-card-info">
        <span className="eyebrow">{book.category}</span>
        <h3><Link href={`/books/${book.id}`}>{book.title}</Link></h3>
        <p>{book.author}</p>
        <Link className="text-link" href={`/books/${book.id}`}>
          Xem chi tiết <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
