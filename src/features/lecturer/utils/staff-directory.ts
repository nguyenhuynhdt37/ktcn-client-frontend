import type { StaffItem } from "../types/lecturer.types";

export interface StaffDirectoryFilters {
  q?: string;
  department?: string;
  research?: string;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

type SearchableStaff = Pick<StaffItem, "full_name"> &
  Partial<Pick<StaffItem, "english_name" | "department_id" | "research_interests">>;

export function filterStaffs<T extends SearchableStaff>(
  staffs: T[],
  filters: StaffDirectoryFilters,
): T[] {
  const query = normalize(filters.q || "");
  const research = normalize(filters.research || "");
  return staffs.filter(
    (staff) =>
      (!filters.department || staff.department_id === filters.department) &&
      (!query || normalize(`${staff.full_name} ${staff.english_name || ""}`).includes(query)) &&
      (!research ||
        normalize((staff.research_interests || "").replace(/<[^>]*>/g, " ")).includes(research)),
  );
}

export function getStaffQualifications(
  staff: Partial<Pick<StaffItem, "academic_title" | "degree">>,
  locale: string,
): string {
  const abbreviations: Record<string, string> =
    locale === "en"
      ? {
          professor: "Prof.",
          "associate professor": "Assoc. Prof.",
          doctorate: "PhD",
          doctor: "PhD",
          master: "MSc",
          bachelor: "BSc",
        }
      : {
          "giao su": "GS.",
          "pho giao su": "PGS.",
          "tien si": "TS.",
          "thac si": "ThS.",
          "cu nhan": "CN.",
          "ky su": "KS.",
        };
  return [staff.academic_title, staff.degree]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => abbreviations[normalize(value)] || value.trim())
    .join(" ");
}
