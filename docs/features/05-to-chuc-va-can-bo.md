# 🏛️ Cơ Cấu Tổ Chức Đơn Vị & Hồ Sơ Cán Bộ Giảng Viên
> **Trường Kỹ Thuật và Công Nghệ - Đại Học Vinh**  
> Nghiệp vụ: **Departments & Academic Staff** | Mã nguồn: [`src/features/department`](../../src/features/department), [`src/features/lecturer`](../../src/features/lecturer)

Tài liệu này mô tả chi tiết cách thức Frontend kết nối với Backend FastAPI để kết xuất sơ đồ tổ chức, trang giới thiệu từng bộ môn chuyên môn, và trang hồ sơ khoa học cá nhân của từng cán bộ giảng viên thuộc trường.

---

## 1. Điểm Cuối API (Backend Endpoints)

### 1.1. Cơ Cấu Tổ Chức & Bộ Môn (`departmentService`)
| Phương thức | Đường dẫn API | Tham số | Mục đích |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/portal/departments` | `unit_type`: Loại đơn vị (Khoa/Bộ môn/Phòng)<br>`search`: Từ khóa tìm kiếm | Lấy danh sách toàn bộ các phòng ban, khoa và bộ môn |
| `GET` | `/api/v1/portal/departments/{slug}/overview` | `slug`: Đường dẫn bộ môn<br>`lang`: `vi` \| `en` | Lấy thông tin tổng quan, ban chủ nhiệm, thông tin liên lạc |
| `GET` | `/api/v1/portal/departments/{slug}` | `slug`: Đường dẫn bộ môn | Lấy chi tiết thông tin đơn vị |

### 1.2. Cán Bộ & Giảng Viên (`lecturerService`)
| Phương thức | Đường dẫn API | Tham số | Mục đích |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/portal/staffs` | `department_slug`: Slug bộ môn hoặc `ban-lanh-dao-vien`<br>`lang`: `vi` \| `en` | Lấy danh sách cán bộ, giảng viên thuộc đơn vị cụ thể |
| `GET` | `/api/v1/portal/staffs/{slug}` | `slug`: Mã định danh giảng viên | Lấy chi tiết hồ sơ khoa học của một cán bộ |

---

## 2. Mã Nguồn Dịch Vụ Phía Frontend

### 2.1. Dịch Vụ Đơn Vị ([`departmentService.ts`](../../src/features/department/services/departmentService.ts))
```typescript
export const departmentService = {
  getOverview(slug: string, lang?: string): Promise<DepartmentOverview | null> {
    return httpClient.get<DepartmentOverview>(`/api/v1/portal/departments/${slug}/overview`, {
      params: lang ? { lang } : undefined,
      revalidate: 300, // Cache 5 phút
      tags: [`department-${slug}`],
    });
  },

  getDepartments(params?: { unit_type?: string; search?: string; lang?: string }): Promise<PortalDepartment[] | null> {
    return httpClient.get<PortalDepartment[]>("/api/v1/portal/departments", {
      params,
      revalidate: 300,
      tags: ["departments"],
    });
  },
};
```

### 2.2. Dịch Vụ Giảng Viên ([`lecturerService.ts`](../../src/features/lecturer/services/lecturerService.ts))
```typescript
export const lecturerService = {
  // Lấy danh sách giảng viên theo bộ môn (mặc định lấy Ban Lãnh Đạo Viện nếu không truyền slug)
  async getStaffs(filters: { departmentSlug?: string; lang?: string } = {}): Promise<StaffItem[] | null> {
    const langHeader = await getLanguageHeader();
    const locale = filters.lang || (langHeader["Accept-Language"] || "vi").split("-")[0].toLowerCase();
    
    let departmentSlug = filters.departmentSlug;
    if (!departmentSlug) {
      departmentSlug = locale === "en" ? "institute-board-of-management" : "ban-lanh-dao-vien";
    }

    return httpClient.get<StaffItem[]>("/api/v1/portal/staffs", {
      params: { department_slug: departmentSlug, lang: locale },
      revalidate: 600, // Cache 10 phút
    });
  },

  // Lấy chi tiết hồ sơ khoa học của cán bộ theo slug
  async getStaffBySlug(slug: string): Promise<StaffItem | null> {
    return httpClient.get<StaffItem>(`/api/v1/portal/staffs/${slug}`, {
      revalidate: 300,
      tags: [`staff-${slug}`],
    });
  },
};
```

---

## 3. Luồng Hiển Thị Giao Diện Người Dùng

### 3.1. Trang Chi Tiết Bộ Môn (`bo-mon/[slug]/page.tsx`)
- Server Component nhận `slug` từ URL (ví dụ: `cong-nghe-thong-tin`, `dien-tu-vien-thong`, `co-khi-che-tao`).
- Gọi song song `departmentService.getOverview(slug)` và `lecturerService.getStaffs({ departmentSlug: slug })`.
- Hiển thị:
  - Khối thông tin chung: Giới thiệu lịch sử hình thành, mục tiêu đào tạo, phòng thí nghiệm trực thuộc.
  - Khối Ban chủ nhiệm bộ môn: Trưởng bộ môn, Phó trưởng bộ môn kèm ảnh chân dung và liên hệ.
  - Lưới danh sách giảng viên trực thuộc: Thẻ thông tin rút gọn kèm học hàm (GS/PGS), học vị (TS/ThS).

### 3.2. Trang Hồ Sơ Giảng Viên (`nhan-su/[slug]/page.tsx`)
- Hiển thị lý lịch khoa học chuẩn học thuật:
  - Ảnh chân dung kích thước chuẩn, chức danh khoa học, chức vụ hành chính.
  - Email cơ quan (`@vinhuni.edu.vn`), số điện thoại bàn, phòng làm việc.
  - Quá trình đào tạo (Đại học, Thạc sĩ, Tiến sĩ tại các trường trong và ngoài nước).
  - Hướng nghiên cứu chuyên sâu (Research Interests).
  - Danh mục các công trình bài báo đã công bố trên tạp chí quốc tế (ISI/Scopus), sách chuyên khảo và đề tài NCKH các cấp.
