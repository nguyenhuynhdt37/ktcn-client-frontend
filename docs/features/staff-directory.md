# Danh sách cán bộ

## Mục tiêu và phạm vi

Theo yêu cầu ngày 10/11/2026, tham khảo cấu trúc danh sách cán bộ khoa tại https://soict.hust.edu.vn/danh-sach-can-bo-khmt.html và danh bạ tại https://soict.hust.edu.vn/can-bo. Dùng dữ liệu và nhận diện của Trường Kỹ thuật và Công nghệ, Đại học Vinh.

- Trang khoa/bộ môn: danh sách ảnh cố định, không tự chạy và không nhân bản cán bộ; hiển thị họ tên, học hàm/học vị và chức vụ, liên kết đến hồ sơ.
- Trang `Giới thiệu > Cán bộ`: `/vi/gioi-thieu/can-bo`, tiếng Anh `/en/about/staff`; tìm tên có/không dấu, lọc đơn vị và từ khóa lĩnh vực nghiên cứu, kết hợp các điều kiện, có nút xóa bộ lọc và trạng thái không có kết quả. Bộ lọc nghiên cứu dùng ô tìm kiếm vì API hiện cung cấp văn bản tự do, chưa có danh mục nghiên cứu chuẩn hóa. Form GET giữ điều kiện trong URL để chia sẻ và dùng được khi tắt JavaScript.
- Dữ liệu lấy từ API công khai `/api/v1/portal/staffs` đang lọc cán bộ active/visible. Không thay đổi hàm lấy ban lãnh đạo mặc định; thêm hàm lấy toàn bộ cán bộ riêng.
- Menu desktop/mobile có mục Cán bộ trong Giới thiệu, không thêm trùng nếu API đã cấu hình liên kết này. Trang mới có metadata, breadcrumb và sitemap đa ngôn ngữ.

## Thiết kế

Ưu tiên tra cứu hồ sơ. Danh sách là lưới ảnh chân dung trên nền trắng, tên và thông tin ngắn bên dưới, không cắt mất tên. Giữ màu xanh và đỏ thương hiệu hiện có. Điện thoại dùng hai cột, màn hình rộng dùng bốn cột cho trang đơn vị và năm cột cho danh bạ. Bộ lọc có nhãn và hỗ trợ bàn phím. Ảnh thiếu/lỗi dùng chữ cái tên qua StaffPortrait, không thay bằng ảnh sự kiện. Trạng thái lỗi tải dữ liệu phân biệt với danh sách rỗng.

## Cấu trúc và quy ước

UI, kiểu dữ liệu và dịch vụ nằm trong `src/features/lecturer`; tiện ích menu trong `src/features/menu`; route trong `src/app/[locale]/(public)/gioi-thieu/can-bo`. Dùng TypeScript strict, `Link` từ `@/i18n/routing`, lớp Tailwind và nhãn vi/en. Ví dụ: `<Link href={{ pathname: "/nhan-su/[slug]", params: { slug: staff.slug } }}>`.

## Thứ tự thực hiện

1. Component lưới cán bộ dùng chung và thay dãy trượt trên trang đơn vị.
2. Dịch vụ lấy danh bạ và trang tìm kiếm/lọc.
3. Menu, i18n, sitemap; kiểm tra hồi quy và trình duyệt.

## Kiểm tra

- `node --test tests/*.test.mjs`: kiểm tra lọc kết hợp, tìm không dấu và menu không trùng.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`.
- `node node_modules/next/dist/bin/next build`.
- ESLint các file mới/sửa; so sánh lỗi có sẵn trước thay đổi.
- Trình duyệt: desktop/mobile, bộ lọc, liên kết hồ sơ, menu và trạng thái rỗng/lỗi. Nếu API chưa chạy, dùng fixture qua máy chủ QA ngoài mã nguồn sản phẩm và ghi rõ giới hạn kiểm chứng.

## Ranh giới

Luôn giữ thay đổi có sẵn của người dùng và dùng API công khai. Hỏi trước nếu cần thay schema dữ liệu, dependency mới hoặc thay CI. Không sao chép dữ liệu nhân sự/ảnh từ trang tham khảo, sửa dữ liệu production hoặc thay luồng ban lãnh đạo trang chủ.

## Kết quả kiểm chứng 11/11/2026

13 Node tests và build production (bao gồm TypeScript) đạt. Chrome kiểm tra tìm tên không dấu qua form thực, lọc kết hợp đơn vị/nghiên cứu, xóa lọc, mở hồ sơ, menu desktop/mobile, trang tiếng Anh và URL canonical/breadcrumb, hai cột trên điện thoại và không tràn ngang ở 320/375/768/1024/1440px. Kiểm tra riêng danh sách rỗng, API trả lỗi và chuỗi tìm kiếm chứa markup đều đạt. API thật ở localhost:8000 chưa chạy nên kiểm tra trình duyệt dùng máy chủ fixture tạm ngoài repo, đã dừng sau kiểm tra. File mới sạch ESLint; các lỗi ESLint có sẵn trong navigation, breadcrumb và sitemap được giữ ngoài phạm vi.

Khi chạy QA với Next.js 16.2.9, bind `localhost` để tránh vòng chuyển hướng rewrite ngôn ngữ do địa chỉ bind khác origin. Không sửa proxy hoặc cấu hình triển khai trong thay đổi này.
