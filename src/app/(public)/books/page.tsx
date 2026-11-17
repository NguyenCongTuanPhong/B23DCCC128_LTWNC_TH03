import type { Metadata } from 'next';
import Link from 'next/link';
import BookCard from '@/components/BookCard';
import BookFilter from '@/components/BookFilter';
import { getBookCategories, loadBooksShift } from '@/lib/books';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Kho sách',
  description: 'Tìm và lọc sách công nghệ tại Thư viện Khoa CNTT.',
};

type SearchParams = Promise<{
  category?: string | string[];
  q?: string | string[];
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const category = firstValue(params.category);
  const query = firstValue(params.q)?.trim();
  const books = loadBooksShift().filter((book) => {
    const matchesCategory = !category || book.category === category;
    const normalizedQuery = query?.toLocaleLowerCase('vi');
    const matchesQuery =
      !normalizedQuery ||
      `${book.title} ${book.author}`.toLocaleLowerCase('vi').includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
  const categories = getBookCategories();

  return (
    <div className="page-container">
      <section className="page-intro">
        <span className="eyebrow">DANH MỤC THƯ VIỆN</span>
        <h1>Kho sách<br /><span>công nghệ.</span></h1>
        <p>Tìm cuốn sách phù hợp với hành trình học tập và nghiên cứu của bạn.</p>
      </section>
      <BookFilter categories={categories} filters={{ category, query }} />
      <div className="results-heading">
        <p><strong>{books.length}</strong> đầu sách</p>
        {(category || query) && <Link href="/books">Xóa bộ lọc ×</Link>}
      </div>
      {books.length > 0 ? (
        <div className="book-grid">
          {books.map((book) => <BookCard book={book} key={book.id} />)}
        </div>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">⌕</span>
          <h2>Chưa tìm thấy sách phù hợp</h2>
          <p>Thử từ khóa khác hoặc bỏ bộ lọc để xem toàn bộ danh mục.</p>
          <Link className="button button-dark" href="/books">Xem tất cả sách</Link>
        </div>
      )}
    </div>
  );
}
