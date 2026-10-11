# 🎓 Đào Tạo & Đăng Ký Tư Vấn Tuyển Sinh
> **Trường Kỹ Thuật và Công Nghệ - Đại Học Vinh**  
> Nghiệp vụ: **Training Programs & Admission Consultation** | Mã nguồn: [`src/features/program`](../../src/features/program), [`src/features/consultation`](../../src/features/consultation)

Tài liệu này mô tả chi tiết cách thức Frontend hiển thị các chương trình đào tạo (Đại học & Sau đại học) và cơ chế xử lý biểu mẫu trực tuyến cho phép thí sinh đăng ký tư vấn tuyển sinh gửi trực tiếp về Backend FastAPI.

---

## 1. Điểm Cuối API (Backend Endpoints)

| Phương thức | Đường dẫn API | Tham số / Body | Mục đích |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/portal/programs` | `lang`: `vi` \| `en`<br>`degree_level`: `bachelor` \| `master` \| `doctorate` | Lấy danh sách chương trình đào tạo theo bậc học |
| `GET` | `/api/v1/portal/programs/{slug}` | `slug`: Mã định danh CTĐT<br>`lang`: `vi` \| `en` | Lấy chi tiết chương trình đào tạo, chuẩn đầu ra, khung học phần |
| `POST` | `/api/v1/portal/consultations` | JSON Body: Họ tên, SĐT, Email, Ngành quan tâm, Lời nhắn | Tiếp nhận hồ sơ đăng ký tư vấn tuyển sinh từ thí sinh |

---

## 2. Quản Lý Chương Trình Đào Tạo (`programService`)

Tệp mã nguồn: [`src/features/program/services/programService.ts`](../../src/features/program/services/programService.ts)

```typescript
export const programService = {
  // Lấy danh sách chương trình đào tạo theo bậc học (Đại học / Sau đại học)
  async getAll(locale: string, degreeLevel?: string): Promise<ProgramSummary[]> {
    try {
      const params = new URLSearchParams({ lang: locale });
      if (degreeLevel) params.set("degree_level", degreeLevel);
      const response = await fetch(`${API_BASE}?${params.toString()}`, {
        next: { revalidate: 300 }, // Cache 5 phút
      });
      if (!response.ok) return [];
      return (await response.json()) as ProgramSummary[];
    } catch {
      return [];
    }
  },

  // Lấy chi tiết chương trình đào tạo
  async getDetail(slug: string, locale: string): Promise<ProgramDetail | null> {
    try {
      const response = await fetch(
        `${API_BASE}/${encodeURIComponent(slug)}?lang=${encodeURIComponent(locale)}`,
        { next: { revalidate: 300 } },
      );
      if (!response.ok) return null;
      return (await response.json()) as ProgramDetail;
    } catch {
      return null;
    }
  },
};
```

---

## 3. Biểu Mẫu Đăng Ký Tư Vấn Tuyển Sinh (`consultationService`)

### 3.1. Dữ Liệu Payload Gửi Lên Backend (`ConsultationFormPayload`)
```typescript
export interface ConsultationFormPayload {
  full_name: string;        // Họ và tên thí sinh (Bắt buộc)
  phone_number: string;     // Số điện thoại liên hệ (Bắt buộc, chuẩn 10 chữ số)
  email?: string;           // Hòm thư điện tử (Tùy chọn)
  major_code?: string;      // Mã ngành thí sinh quan tâm (ví dụ: 7480201)
  message?: string;         // Câu hỏi hoặc thắc mắc của thí sinh
  notes?: string;           // Ghi chú thêm
}
```

### 3.2. Mã Nguồn Gửi API Từ Client Component
Tệp mã nguồn: [`src/features/consultation/services/consultationService.ts`](../../src/features/consultation/services/consultationService.ts)

```typescript
import { axiosClient } from "@/shared/api/axios-client";
import type { ConsultationCreatedResponse, ConsultationFormPayload } from "../types/consultation.types";

export const consultationService = {
  async create(payload: ConsultationFormPayload): Promise<ConsultationCreatedResponse> {
    const response = await axiosClient.post<ConsultationCreatedResponse>(
      "/api/v1/portal/consultations",
      payload,
    );
    return response.data;
  },
};
```

### 3.3. Quy Trình Trải Nghiệm Người Dùng (UX Flow)
1. Thí sinh truy cập trang `/tu-van-tuyen-sinh` hoặc khối tư vấn tại trang chủ (`ConsultationCallout`).
2. Biểu mẫu sử dụng `react-hook-form` kết hợp `zod` schema để kiểm tra tính hợp lệ dữ liệu ngay tại trình duyệt:
   - Số điện thoại phải đúng định dạng số liên lạc Việt Nam.
   - Họ tên không được để trống.
   - Email (nếu nhập) phải có cấu trúc hợp lệ.
3. Khi nhấn nút "Gửi thông tin đăng ký":
   - Nút chuyển sang trạng thái đang xử lý (`isSubmitting = true`), hiển thị hiệu ứng xoay (Spinner).
   - Gọi `consultationService.create()` gửi JSON lên Backend FastAPI.
   - Nếu thành công: Hiển thị hộp thoại chúc mừng hoặc thông báo Toast màu xanh, xóa sạch các ô nhập liệu trong form.
   - Nếu thất bại: Bắt mã lỗi từ backend và hiển thị cảnh báo hướng dẫn người dùng thử lại hoặc liên hệ số hotline trực tiếp.
