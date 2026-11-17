# Giao diện CET test-v2

## Phạm vi

Branch `feature/test-v2-cet` phát triển giao diện theo mẫu https://cet.vinhuni.edu.vn/.
Chỉ bật giao diện mới khi biến môi trường server `FRONTEND_THEME=cet-v2`.
Nếu không đặt biến này, trang chủ, header và footer cũ vẫn hoạt động như trước.
Triển khai bằng một frontend riêng; không triển khai branch này vào container của
https://test-ktcn.itup.io.vn/ hoặc production. Dùng chung Portal API của môi trường test,
không thay đổi database, backend hoặc admin.

## Giao diện và dữ liệu

- Header đỏ đô, logo và thông tin liên hệ từ settings; menu đệ quy từ Portal API.
- Trang chủ: giới thiệu và thông báo, liên kết nhanh, tin tức, ngành đào tạo, các khoa,
  thống kê theo dữ liệu thực. Không dùng nội dung tin tức hoặc số liệu mẫu của template.
- Giữ các đường dẫn bài viết, tìm kiếm, ngành học, khoa và chuyển ngôn ngữ hiện có.
  Khi đổi ngôn ngữ ở trang chi tiết, trở về danh sách tương ứng vì slug do backend
  dịch riêng theo ngôn ngữ; không dùng lại slug tiếng Việt cho bài tiếng Anh.
- Menu dùng được bằng bàn phím và trên điện thoại; nội dung có trạng thái rỗng/lỗi.
- CSS Modules cô lập phần giao diện mới; không nạp Bootstrap hoặc script của template.
- Bốn loại trang trong đã chuyển sang giao diện mới, chỉ hiển thị khi `FRONTEND_THEME=cet-v2`:
  - Danh sách tin và tìm kiếm (`/vi/tim-kiem`): các nút chuyên mục lấy từ cây
    chuyên mục thật, lọc theo thẻ có ghi chú và liên kết xóa bộ lọc, phân trang, thẻ "Đọc nhiều".
  - Chi tiết bài viết: ảnh bìa, thẻ, chia sẻ, thẻ "Tin liên quan" (ẩn nếu không có bài liên quan).
  - Ban lãnh đạo (`/vi/bo-mon/ban-lanh-dao-vien`): nhóm Hiệu trưởng, Phó Hiệu trưởng, thành viên khác.
  - Trang khoa/bộ môn: sidebar mục (Giới thiệu, Chương trình đào tạo, Tin tức, Cán bộ), thẻ cán bộ,
    thông tin liên hệ.
- Đào tạo, Giới thiệu, Lịch tuần, Nhân sự và Tư vấn tuyển sinh vẫn dùng nội dung cũ.

## Kiểm tra

`node --test tests/*.test.mjs`, `pnpm exec tsc --noEmit`, `pnpm build`.
Kiểm tra thực tế trang chủ, tìm kiếm, bài viết, menu, tiếng Anh và viewport
320 / 768 / 1024 / 1440 px. Kiểm tra website test cũ vẫn trả HTTP 200 và container cũ
không bị tạo lại sau khi triển khai.

Kiểm tra cục bộ dùng `.env.local` với `FRONTEND_THEME=cet-v2` và `NEXT_PUBLIC_API_URL`
trỏ tới API test; xóa hoặc đổi biến `FRONTEND_THEME` để so sánh với giao diện cũ.

## Triển khai và khôi phục

Chạy image frontend riêng với `NEXT_PUBLIC_SITE_URL` trỏ hostname mới và
`NEXT_PUBLIC_API_URL` trỏ API test. Chỉ thêm ingress mới, không đổi ingress test cũ.
Khôi phục bằng cách dừng frontend v2 và bỏ ingress v2; không tác động dữ liệu chung.

## Cấu hình server

- Frontend riêng: Compose project `ktcn-test-v2`, cổng `13003`, network `ktcn-test_default`.
- `deploy/test-v2.compose.yml` chạy độc lập với Compose của test hiện tại.
- `deploy/test-v2.traefik.yml` là file route riêng cho gateway, không sửa `dynamic.yml`.
- Hostname: `https://test-v2-ktcn.itup.io.vn`; `/api/` chuyển tới backend test sẵn có.
  Build với `NEXT_PUBLIC_API_URL=https://test-v2-ktcn.itup.io.vn` để request từ trình
  duyệt cùng origin, không cần sửa CORS hay restart backend test.
- SSR dùng `API_URL=http://ktcn-test-backend-1:8000` trong Docker network.
- Biến `REVALIDATION_TOKEN` được tạo riêng tại server, không đưa vào Git.
- Gateway gửi `X-Robots-Tag: noindex, nofollow` cho bản thử nghiệm.

Build image:

```sh
docker build --build-arg NEXT_PUBLIC_API_URL=https://test-v2-ktcn.itup.io.vn \
  --build-arg NEXT_PUBLIC_SITE_URL=https://test-v2-ktcn.itup.io.vn \
  --build-arg IMAGE_ALLOW_LOCAL_IP=true -t ktcn-frontend-test-v2:20261117 .
docker compose -f deploy/test-v2.compose.yml up -d
```
