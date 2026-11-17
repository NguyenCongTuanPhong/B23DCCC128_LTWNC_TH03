import type { BookFilters } from '@/types/book';

type BookFilterProps = {
  categories: string[];
  filters: BookFilters;
};

export default function BookFilter({ categories, filters }: BookFilterProps) {
  return (
    <form className="filter-form" action="/books" method="get">
      <label className="filter-search">
        <span>Tìm sách</span>
        <input
          type="search"
          name="q"
          defaultValue={filters.query}
          placeholder="Tên sách, tác giả..."
        />
      </label>
      <label>
        <span>Danh mục</span>
        <select name="category" defaultValue={filters.category ?? ''}>
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </label>
      <button className="button button-dark" type="submit">Lọc sách</button>
    </form>
  );
}
