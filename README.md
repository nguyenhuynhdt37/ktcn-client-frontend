# 🏦 KTCN Portal Client - Cổng Thông Tin & Dịch Vụ Sinh Viên Khoa Tài Chính Ngân Hàng

[![Next.js 16](https://img.shields.io/badge/Next.js-16.0-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS 3.4](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![next-intl](https://img.shields.io/badge/i18n-next--intl-blue?style=for-the-badge)](https://next-intl-docs.vercel.app/)

Cổng thông tin điện tử & Dịch vụ sinh viên chính thức của **Khoa Tài Chính Ngân Hàng - Trường Công nghệ Thông tin & Truyền thông**. Hệ thống được xây dựng trên nền tảng **Next.js 16 (App Router)** và **React 19**, mang lại hiệu năng tải trang vượt trội, hỗ trợ SEO mạnh mẽ và trải nghiệm người dùng hiện đại.

---

## 📑 Mục Lục
- [Tổng Quan Dự Án](#-tổng-quan-dự-án)
- [Tính Năng Nổi Bật](#-tính-năng-nổi-bật)
- [Kiến Trúc & Công Nghệ](#-kiến-trúc--công-nghệ)
- [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
- [Biến Môi Trường (.env)](#-biến-môi-trường-env)
- [Hướng Dẫn Cài Đặt & Khởi Chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
- [Tài Liệu API Liên Quan](#-tài-liệu-api-liên-quan)

---

## 🎯 Tổng Quan Dự Án

Dự án đóng vai trò là mặt tiền số hóa cho Khoa Tài Chính Ngân Hàng, giúp kết nối Nhà trường với Sinh viên, Cựu sinh viên và Doanh nghiệp tuyển dụng:
- **Định danh thương hiệu:** Giới thiệu lịch sử, ban lãnh đạo, đội ngũ giảng viên và bộ môn đào tạo.
- **Số hóa dịch vụ hành chính:** Cung cấp biểu mẫu, quy trình xin xác nhận, xin hoãn thi và nộp đơn trực tuyến.
- **Truyền thông tin tức:** Cập nhật thông báo đào tạo, lịch thi, hội thảo khoa học và tin tuyển dụng doanh nghiệp.

---

## ✨ Tính Năng Nổi Bật

### 🌐 1. Giao Diện Người Dùng & Trải Nghiệm (UI/UX)
- **Responsive 100%:** Hiển thị mượt mà trên Desktop, Tablet và Mobile với Tailwind CSS.
- **Dark / Light Mode:** Chuyển đổi giao diện sáng/tối linh hoạt.
- **Đa ngôn ngữ (i18n):** Chuyển đổi linh hoạt giữa tiếng Việt (`vi`) và tiếng Anh (`en`) thông qua `next-intl`.

### 📰 2. Tin Tức & Sự Kiện
- Bài viết được phân loại theo danh mục: *Tin tuyển sinh, Tin đào tạo, Hoạt động sinh viên, Nghiên cứu khoa học*.
- Bộ lọc bài viết nâng cao, tìm kiếm theo từ khóa và phân trang tự động.
- Trình xem chi tiết bài viết với định dạng Rich Text, hiển thị hình ảnh chất lượng cao và các bài viết liên quan.

### 📄 3. Cổng Dịch Vụ Sinh Viên
- Tra cứu và tải về các biểu mẫu thủ tục hành chính (Đơn xin tạm hoãn học, Đơn xin bảo lưu, Đơn xin miễn giảm học phí).
- Tra cứu thông tin bộ môn, danh sách giảng viên kèm email/số điện thoại liên hệ.
- Banner slider quảng bá sự kiện lớn với hiệu ứng kéo thả mượt mà.

---

## 🛠️ Kiến Trúc & Công Nghệ

| Phân Loại | Công Nghệ / Thư Viện | Mô Tả |
| :--- | :--- | :--- |
| **Core Framework** | Next.js 16 (App Router) | React Framework tối ưu Server-Side Rendering (SSR) & Static Generation (SSG) |
| **UI Library** | React 19, Radix UI, Lucide Icons | Bộ component accessible và hệ thống icon sắc nét |
| **Styling** | Tailwind CSS v3.4, PostCSS | Utility-first CSS framework |
| **Internationalization** | `next-intl` | Thư viện quản lý dịch thuật đa ngôn ngữ chuẩn Next.js |
| **Animation** | Framer Motion | Hiệu ứng chuyển trang và mượt mà cho các element UI |
| **State & HTTP** | Axios, React Query / SWR | Xử lý giao tiếp RESTful API bất đồng bộ |

---

## 📁 Cấu Trúc Thư Mục

```
ktcn-client-frontend/
├── public/                     # Tài nguyên tĩnh (Logo, Icons, Fonts, Uploads)
├── src/
│   ├── app/                    # Next.js App Router Structure
│   │   ├── [locale]/           # i18n routing wrapper (vi / en)
│   │   │   ├── (auth)/         # Trang Đăng nhập / Đăng ký
│   │   │   ├── articles/       # Trang Danh sách & Chi tiết bài viết
│   │   │   ├── services/       # Trang Dịch vụ sinh viên & Biểu mẫu
│   │   │   ├── faculty/        # Trang Giới thiệu Khoa & Giảng viên
│   │   │   ├── page.tsx        # Trang chủ Portal
│   │   │   └── layout.tsx      # Root Layout với Providers & Header/Footer
│   ├── components/             # Reusable UI Components
│   │   ├── common/             # Navbar, Footer, Loading Spinner, Modal
│   │   ├── home/               # BannerSlider, NewsFeed, StatsWidget
│   │   └── ui/                 # Button, Input, Card, Dropdown
│   ├── config/                 # Cấu hình i18n & API Routes
│   ├── i18n/                   # File JSON từ điển tiếng Việt (vi.json) & tiếng Anh (en.json)
│   ├── lib/                    # Helper functions, Axios instance
│   └── types/                  # TypeScript interfaces (Article, User, Category)
├── tailwind.config.js          # Cấu hình Tailwind CSS theme & custom colors
├── next.config.mjs             # Cấu hình Next.js build & image domains
└── package.json                # Danh sách dependencies & scripts
```

---

## 🔐 Biến Môi Trường (.env)

Tạo file `.env.local` tại thư mục gốc với các thông số sau:

```env
# URL kết nối tới Backend API (ktcn-backend-api)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Cấu hình Ngôn ngữ mặc định
NEXT_PUBLIC_DEFAULT_LOCALE=vi

# Image Domain Whitelist
NEXT_PUBLIC_IMAGE_SERVER_URL=http://localhost:8000
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu cầu hệ thống:
- **Node.js**: `v18.17.0` trở lên (Khuyên dùng `v20.x`)
- **Trình quản lý gói**: `npm` v9+ hoặc `pnpm`

### Các bước thực hiện:

1. **Clone mã nguồn từ GitHub:**
   ```bash
   git clone https://github.com/nguyenhuynhdt37/ktcn-client-frontend.git
   cd ktcn-client-frontend
   ```

2. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install
   ```

3. **Cấu hình file môi trường:**
   ```bash
   cp .env.example .env.local
   ```

4. **Khởi chạy máy chủ phát triển (Development):**
   ```bash
   npm run dev
   ```

5. **Truy cập ứng dụng:**
   Mở trình duyệt và truy cập: `http://localhost:3000`

6. **Biên dịch sản phẩm (Production Build):**
   ```bash
   npm run build
   npm run start
   ```

---

## 🔗 Tài Liệu API Liên Quan

Frontend kết nối trực tiếp với Backend API:
- **Backend Repository:** [`ktcn-backend-api`](https://github.com/nguyenhuynhdt37/ktcn-backend-api)
- **Admin Portal Repository:** [`ktcn-admin-portal`](https://github.com/nguyenhuynhdt37/ktcn-admin-portal)

---

## 👨‍💻 Tác Giả

**Nguyễn Xuân Huỳnh**  
- **GitHub:** [@nguyenhuynhdt37](https://github.com/nguyenhuynhdt37)  
- **Email:** nguyenhuynhdt37@gmail.com
