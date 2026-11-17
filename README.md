# Thư viện Khoa CNTT – Đăng ký mượn sách

Ứng dụng Next.js App Router cho phép tra cứu tài liệu, gửi yêu cầu mượn sách,
và xét duyệt yêu cầu theo vai trò sinh viên/thủ thư.

## Chạy ứng dụng

```bash
npm install
npm run dev
```

Tài khoản demo dùng cho bài thực hành (được khai báo trong `src/data/users.ts`):

- Sinh viên 1: `sv01@ptit.edu.vn` / `sv123456`
- Sinh viên 2: `sv02@ptit.edu.vn` / `sv123456`
- Thủ thư: `admin@ptit.edu.vn` / `admin123`

Đặt `AUTH_SECRET` riêng trong `.env.local`; xem `.env.example`.

## Render và bảo vệ route

- `/`: trang chủ tĩnh (SSG).
- `/books`: SSR; từ khóa `q` và danh mục `category` được đọc từ URL.
- `/books/[id]`: tạo trang sách bằng `generateStaticParams` và ISR mỗi giờ.
- `/loans`: SSR theo `searchParams`, lọc trạng thái và phân trang; sinh viên
  xem/hủy yêu cầu của mình, thủ thư xem toàn bộ.
- `/admin`: SSR, chỉ thủ thư được duyệt hoặc từ chối yêu cầu.
- `src/proxy.ts`, route-group layout và từng Server Action cùng kiểm tra quyền.
- Root layout không gọi `auth()`, giữ các trang công khai có thể prerender.
- Validation form tập trung trong `src/lib/loan-validate.ts`; nghiệp vụ lọc,
  phân trang, tồn kho và hủy nằm trong `src/lib/loans.ts`.

Dữ liệu gồm 24 đầu sách thuộc 4 danh mục (6 sách mỗi danh mục), 3 tài khoản và
37 yêu cầu mượn mẫu; tất cả được khởi tạo trong bộ nhớ của tiến trình Node.js.
Thay đổi yêu cầu sẽ mất khi khởi động lại server và không được đồng bộ giữa
nhiều process/instance; đây là giới hạn có chủ ý của bài thực hành không dùng
database.

## Kiểm thử

```bash
npm run build
npm test
npm run coverage
```

Vitest dùng jsdom và React Testing Library; test được đặt cạnh file nguồn.
Lệnh coverage tạo báo cáo HTML tại `coverage/index.html`, kiểm tra từng tệp mục
tiêu đạt Lines ít nhất 70%, và tạo ảnh tổng quan tại `coverage.png`.
