import { httpClient } from "@/shared/api/httpClient";
import type { DepartmentOverview, PortalDepartment } from "../types/department.types";

export const departmentService = {
  getOverview(slug: string, lang?: string): Promise<DepartmentOverview | null> {
    return httpClient.get<DepartmentOverview>(`/api/v1/portal/departments/${encodeURIComponent(slug)}/overview`, {
      params: lang ? { lang } : undefined,
      revalidate: 300,
      tags: [`department-${slug}`],
    });
  },

  getDepartment(slug: string): Promise<PortalDepartment | null> {
    return httpClient.get<PortalDepartment>(`/api/v1/portal/departments/${encodeURIComponent(slug)}`, {
      revalidate: 300,
      tags: [`department-${slug}`],
    });
  },

  getDepartments(params?: {
    unit_type?: string;
    search?: string;
    lang?: string;
  }): Promise<PortalDepartment[] | null> {
    return httpClient.get<PortalDepartment[]>("/api/v1/portal/departments", {
      params,
      revalidate: 300,
      tags: ["departments"],
    });
  },
};
