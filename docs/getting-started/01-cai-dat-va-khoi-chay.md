# 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Frontend (`ktcn-client-frontend`)
> **Trường Kỹ Thuật và Công Nghệ - Đại Học Vinh**  
> Dự án: `ktcn-client-frontend` | Phiên bản Framework: **Next.js 16.2.9**, **React 19.2.4**, **Tailwind CSS v4**

Tài liệu này cung cấp hướng dẫn từng bước từ số 0 để cài đặt môi trường, cấu hình biến hệ thống và khởi chạy dự án Frontend cổng thông tin Trường Kỹ thuật và Công nghệ - Đại học Vinh trên môi trường phát triển (Local Development) cũng như đóng gói triển khai máy chủ Production với Docker.

---

## 1. Yêu Cầu Môi Trường Kỹ Thuật

Trước khi bắt đầu, hãy đảm bảo máy tính phát triển hoặc máy chủ của bạn đã cài đặt các công cụ sau:

| Công cụ | Phiên bản tối thiểu | Khuyến nghị | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 20.17.0` | **Node.js 22 LTS (22.x)** | Đảm bảo tương thích tối đa với React 19 và Next.js 16 |
| **pnpm** | `>= 9.x` | **pnpm 10.x** | Trình quản lý gói chính thức của dự án (nhanh, tiết kiệm dung lượng) |
| **Docker** (Tùy chọn) | `>= 24.x` | Bản mới nhất | Dành cho việc đóng gói và chạy container môi trường production |
| **Git** | `>= 2.30` | Bản mới nhất | Quản lý phiên bản mã nguồn |

### Kích hoạt `pnpm` nhanh bằng Corepack (Khuyến nghị):
Node.js đã tích hợp sẵn công cụ quản lý gói `corepack`. Bạn chỉ cần mở terminal và chạy:
```bash
corepack enable
corepack prepare pnpm@latest --activate
```
Kiểm tra phiên bản:
```bash
node -v   # Ví dụ: v22.14.0
pnpm -v   # Ví dụ: 10.5.2
```

---

## 2. Cài Đặt Dự Án & Các Gói Phụ Thuộc

### Bước 1: Sao chép mã nguồn (Clone repository)
```bash
git clone https://github.com/vinhuni-set/ktcn-client-frontend.git
cd ktcn-client-frontend
```

### Bước 2: Cài đặt gói phụ thuộc (Dependencies)
Dự án sử dụng file khóa `pnpm-lock.yaml` để cố định phiên bản các thư viện chính xác:
```bash
pnpm install
```
> ⚠️ **Lưu ý:** Tuyệt đối không sử dụng `npm install` hoặc `yarn install` vì có thể làm xung đột cấu trúc `pnpm-lock.yaml` và cơ chế dependency hoisting của Tailwind CSS v4.

---

## 3. Cấu Hình Biến Môi Trường (.env)

Tạo một file `.env.local` hoặc chỉnh sửa file `.env` tại thư mục gốc của dự án:

```ini
# ==============================================================================
# CẤU HÌNH KẾT NỐI API BACKEND FASTAPI
# ==============================================================================
# URL API Backend cho Client-side Browser và Server Components gọi
NEXT_PUBLIC_API_URL=http://localhost:8000

# URL API nội bộ (Dùng khi Server Next.js gọi trực tiếp Backend qua mạng nội bộ Docker)
API_URL=http://localhost:8000

# ==============================================================================
# CẤU HÌNH WEBSITE & SEO METADATA
# ==============================================================================
# Tên miền chính thức của Frontend (Phục vụ SEO Canonical URL, OpenGraph, Sitemap)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ==============================================================================
# CƠ CHẾ ON-DEMAND REVALIDATION (ISR CACHE PURGE)
# ==============================================================================
# Token bí mật để Backend gửi tín hiệu xóa cache khi có bài viết/menu mới
REVALIDATION_TOKEN=dev_revalidation_token_123

# Môi trường chạy (development | production | test)
NODE_ENV=development
```

### Cơ Chế An Toàn Biến Môi Trường (Zod Validation)
Dự án tích hợp cơ chế tự động kiểm tra tính hợp lệ của biến môi trường thông qua schema Zod tại [`src/shared/config/env.ts`](../../src/shared/config/env.ts). Nếu thiếu biến bắt buộc hoặc sai định dạng URL, hệ thống sẽ cảnh báo chi tiết trên terminal.

---

## 4. Khởi Chạy Môi Trường Phát Triển (Development)

Chạy lệnh sau để khởi động máy chủ phát triển cục bộ với chế độ Hot Module Replacement (HMR):

```bash
pnpm dev
```

Máy chủ sẽ lắng nghe tại cổng `3000`:
- **Giao diện Tiếng Việt**: [http://localhost:3000/vi](http://localhost:3000/vi)
- **Giao diện Tiếng Anh**: [http://localhost:3000/en](http://localhost:3000/en)

> 💡 **Mẹo:** Nếu truy cập đường dẫn gốc `http://localhost:3000`, hệ thống middleware/proxy sẽ tự động nhận diện ngôn ngữ ưu tiên của trình duyệt hoặc chuyển hướng mặc định về `/vi`.

---

## 5. Kiểm Tra Chất Lượng Mã Nguồn & Định Dạng (Lint & Format)

Dự án áp dụng quy chuẩn kỹ thuật nghiêm ngặt với **ESLint 9**, **Prettier** và **Husky pre-commit hook**:

```bash
# 1. Kiểm tra lỗi cú pháp và quy chuẩn React/Next.js
pnpm lint

# 2. Tự động sửa các lỗi format và sắp xếp class Tailwind CSS v4
pnpm format
```

---

## 6. Đóng Gói & Chạy Môi Trường Sản Xuất (Production Build)

### 6.1. Build và Chạy Trực Tiếp Bằng Node.js
```bash
# 1. Biên dịch ứng dụng Next.js
pnpm build

# 2. Khởi chạy server production
pnpm start
```
Bản build production sẽ được tối ưu hóa:
- **Tree-shaking**: Loại bỏ hoàn toàn mã dư thừa.
- **Minification**: Nén nhỏ mã nguồn JS/CSS.
- **Output Standalone**: Gom toàn bộ file phụ thuộc vào `.next/standalone` để chạy độc lập mà không cần toàn bộ thư mục `node_modules` nặng nề.

---

### 6.2. Đóng Gói & Triển Khai Bằng Docker (Khuyến Nghị)

Dự án đã có sẵn cấu hình [`Dockerfile`](../../Dockerfile) theo chuẩn **Multi-Stage Build** giúp image thành phẩm có dung lượng siêu nhẹ (~150MB) và đảm bảo an ninh (chạy dưới user không đặc quyền `nextjs`).

#### Bước 1: Build Docker Image
```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL="https://api.ktcn.vinhuni.edu.vn" \
  --build-arg NEXT_PUBLIC_SITE_URL="https://ktcn.vinhuni.edu.vn" \
  -t ktcn-client-frontend:latest .
```

#### Bước 2: Khởi Chạy Container
```bash
docker run -d \
  --name ktcn-client-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="https://api.ktcn.vinhuni.edu.vn" \
  -e NEXT_PUBLIC_SITE_URL="https://ktcn.vinhuni.edu.vn" \
  -e REVALIDATION_TOKEN="super_secret_reval_token_production" \
  --restart unless-stopped \
  ktcn-client-frontend:latest
```

#### Bước 3: Kiểm tra trạng thái Container
```bash
docker ps -f name=ktcn-client-frontend
docker logs -f ktcn-client-frontend
```

---

## 7. Cấu Hình Docker Compose Cho Cả Frontend & Backend

Khi phát triển hoặc triển khai đồng thời cả cụm Frontend và Backend FastAPI trên một máy chủ, có thể sử dụng file `docker-compose.yml` mẫu sau:

```yaml
version: "3.8"

services:
  frontend:
    build:
      context: ./ktcn-client-frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: http://backend:8000
        NEXT_PUBLIC_SITE_URL: http://localhost:3000
    container_name: ktcn-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
      - API_URL=http://backend:8000
      - NEXT_PUBLIC_SITE_URL=http://localhost:3000
      - REVALIDATION_TOKEN=dev_revalidation_token_123
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    # Cấu hình container FastAPI Backend tại cổng 8000
    image: ktcn-backend-api:latest
    container_name: ktcn-backend
    ports:
      - "8000:8000"
    restart: unless-stopped
```

Lúc này, Next.js Server Components sẽ gọi Backend qua mạng Docker nội bộ tốc độ cao (`http://backend:8000`) qua biến `API_URL`, trong khi trình duyệt Client bên ngoài vẫn gọi thông qua `NEXT_PUBLIC_API_URL` (`http://localhost:8000`).
