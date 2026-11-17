import Link from 'next/link';
import BookCard from '@/components/BookCard';
import { getBookCategories, loadBooksShift } from '@/lib/books';

export default function Home() {
  const books = loadBooksShift();
  const featuredBooks = books.slice(0, 3);
  const categories = getBookCategories();

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow eyebrow-light">TRI THỨC MỞ LỐI TƯƠNG LAI</span>
          <h1>Mỗi cuốn sách,<br />một bước tiến mới.</h1>
          <p>
            Khám phá kho tài liệu công nghệ được tuyển chọn dành riêng cho
            cộng đồng sinh viên CNTT.
          </p>
          <Link className="button button-light" href="/books">
            Khám phá kho sách <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-sun" />
          <div className="hero-book hero-book-back">DATA<br />SYSTEMS</div>
          <div className="hero-book hero-book-front">THE ART OF<br /><strong>CODE</strong></div>
          <div className="hero-stamp">ĐỌC<br />&nbsp;·&nbsp;<br />SÁNG<br />TẠO</div>
        </div>
        <div className="hero-index"><span>01</span> / 03</div>
      </section>

      <section className="welcome-strip">
        <p>Không gian tri thức dành cho những người kiến tạo công nghệ.</p>
        <span>THƯ VIỆN KHOA CNTT · TỪ 2024</span>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">BẠN ĐANG TÌM GÌ?</span>
            <h2>Mở đúng trang,<br />chạm đúng ý tưởng.</h2>
          </div>
          <Link className="text-link" href="/books">Xem toàn bộ sách <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <Link
              className={`category-tile category-tile-${index % 4}`}
              href={`/books?category=${encodeURIComponent(category)}`}
              key={category}
            >
              <span className="category-number">0{index + 1}</span>
              <strong>{category}</strong>
              <span className="category-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-block featured-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ĐƯỢC THƯ VIỆN GỢI Ý</span>
            <h2>Những cuốn sách<br />đáng để bắt đầu.</h2>
          </div>
          <Link className="text-link" href="/books">Khám phá thêm <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="book-grid">
          {featuredBooks.map((book) => <BookCard book={book} key={book.id} />)}
        </div>
      </section>

      <section className="borrow-banner">
        <div>
          <span className="eyebrow eyebrow-light">DÀNH CHO SINH VIÊN CNTT</span>
          <h2>Sẵn sàng cho<br />chương tiếp theo?</h2>
        </div>
        <Link className="button button-light" href="/login">Đăng nhập để mượn sách <span aria-hidden="true">↗</span></Link>
      </section>
    </>
  );
}
