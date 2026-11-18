import { env } from "@/shared/config/env";
import type { ProgramDetail, ProgramSummary } from "../types/program.types";

const apiBaseOrigin =
  (typeof window === "undefined" ? process.env.API_URL : null) ||
  env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";
const API_BASE = `${apiBaseOrigin.replace(/\/$/, "")}/api/v1/portal/programs`;

export const programService = {
  async getAll(locale: string, degreeLevel?: string): Promise<ProgramSummary[]> {
    try {
      const params = new URLSearchParams({ lang: locale });
      if (degreeLevel) params.set("degree_level", degreeLevel);
      const response = await fetch(`${API_BASE}?${params.toString()}`, {
        next: { revalidate: 300 },
      });
      if (!response.ok) return [];
      return (await response.json()) as ProgramSummary[];
    } catch {
      return [];
    }
  },

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
