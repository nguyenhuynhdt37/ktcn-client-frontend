import { MenuTreeResponse } from "../types/menu.types";
import { httpClient } from "@/shared/api/httpClient";

export const menuService = {
  /**
   * Lấy cấu trúc cây menu đa ngôn ngữ từ API Portal
   */
  async getMenuTree(code: string): Promise<MenuTreeResponse | null> {
    return httpClient.get<MenuTreeResponse>(`/api/v1/portal/menus/${encodeURIComponent(code)}/tree`, {
      revalidate: 60,
      tags: [`menu-${code}`],
      params: { revision: 6 },
    });
  },
};
