import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBookById, loadBooksShift } from '@/lib/books';

export const revalidate = 3600;

export async function generateStaticParams() {
  return loadBooksShift().map((book) => ({ id: String(book.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = getBookById(id);
  return book
    ? {
        title: book.title,
        description: `${book.title} thuộc danh mục ${book.category} tại Thư viện Khoa CNTT.`,
      }
    : { title: 'Không tìm thấy sách' };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = getBookById(id);
  if (!book) {
    notFound();
  }

  return (
    <div className="page-container">
      <nav className="breadcrumbs" aria-label="Điều hướng">
        <Link href="/">Trang chủ</Link><span>/</span><Link href="/books">Kho sách</Link><span>/</span><span>{book.title}</span>
      </nav>
      <section className="book-detail">
        <div className="detail-cover cover-coral" aria-hidden="true">
          <span className="cover-kicker">CNTT · THƯ VIỆN</span>
          <span className="cover-title">{book.title}</span>
          <span className="cover-author">{book.author}</span>
          <span className="cover-edition">MÃ SÁCH {book.id}</span>
        </div>
        <div className="detail-copy">
          <span className="eyebrow">{book.category}</span>
          <h1>{book.title}</h1>
          <p className="detail-author">Tác giả: {book.author}</p>
          <p className="detail-description">
            Sách thuộc danh mục {book.category}, tác giả {book.author}, hiện có {book.copies} bản tại thư viện.
          </p>
          <dl className="book-facts">
            <div><dt>Mã sách</dt><dd>{book.id}</dd></div>
            <div><dt>Danh mục</dt><dd>{book.category}</dd></div>
            <div><dt>Số bản tại thư viện</dt><dd>{book.copies} bản</dd></div>
          </dl>
          <Link className="button button-dark" href={`/loans?book=${book.id}`}>
            Đăng ký mượn sách <span aria-hidden="true">↗</span>
          </Link>
          <p className="form-hint">Số bản khả dụng được xác nhận theo ngày nhận sách.</p>
        </div>
      </section>
      <div className="detail-back"><Link className="text-link" href="/books">← Trở về kho sách</Link></div>
    </div>
  );
}
