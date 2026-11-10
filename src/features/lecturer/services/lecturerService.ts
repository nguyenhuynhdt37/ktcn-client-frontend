import { StaffItem } from "../types/lecturer.types";
import { httpClient } from "@/shared/api/httpClient";
import { getLanguageHeader } from "@/shared/api/server-api-helper";

export const lecturerService = {
  /** Danh bạ công khai toàn trường, không áp dụng bộ lọc ban lãnh đạo mặc định. */
  async getStaffDirectory(lang: string): Promise<StaffItem[] | null> {
    return httpClient.get<StaffItem[]>("/api/v1/portal/staffs", {
      params: { lang },
      revalidate: 300,
      tags: ["staff-directory"],
    });
  },

  async getStaffBySlug(slug: string): Promise<StaffItem | null> {
    return httpClient.get<StaffItem>(`/api/v1/portal/staffs/${slug}`, {
      revalidate: 300,
      tags: [`staff-${slug}`],
    });
  },

  /**
   * Lấy danh sách giảng viên thuộc một bộ môn hoặc ban lãnh đạo theo bộ môn slug.
   * Mặc định lấy danh sách ban lãnh đạo viện ("ban-lanh-dao-vien" / "institute-board-of-management").
   */
  async getStaffs(filters: {
    departmentSlug?: string;
    lang?: string;
  } = {}): Promise<StaffItem[] | null> {
    const langHeader = await getLanguageHeader();
    const locale = filters.lang || (langHeader["Accept-Language"] || "vi").split("-")[0].toLowerCase();
    
    let departmentSlug = filters.departmentSlug;
    if (!departmentSlug) {
      departmentSlug = locale === "en" ? "institute-board-of-management" : "ban-lanh-dao-vien";
    }

    return httpClient.get<StaffItem[]>("/api/v1/portal/staffs", {
      params: {
        department_slug: departmentSlug,
        lang: locale,
      },
      revalidate: 600, // Cache 10 phút
    });
  },
};
