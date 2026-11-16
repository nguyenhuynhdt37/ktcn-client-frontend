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
  Partial<
    Pick<
      StaffItem,
      "english_name" | "department_id" | "research_interests" | "position" | "department"
    > & { position_name?: string | null }
  >;

const VI_BASE_COLLATOR = new Intl.Collator("vi", { sensitivity: "base" });
const VI_VARIANT_COLLATOR = new Intl.Collator("vi", { sensitivity: "variant" });

/**
 * Xác định mức ưu tiên hiển thị theo chức vụ trên danh bạ cán bộ:
 * 0-2: Ban lãnh đạo Trường (Hiệu trưởng -> Phó Hiệu trưởng phụ trách -> Phó Hiệu trưởng / đơn vị Ban lãnh đạo)
 * 3-4: Trưởng khoa/bộ môn -> Phó trưởng khoa/bộ môn
 * 5: Giảng viên và cán bộ khác
 */
export function getStaffRolePriority(staff: SearchableStaff): number {
  const pos = normalize(staff.position?.name || staff.position_name || "");
  const deptSlug = normalize(staff.department?.slug || "");
  const deptName = normalize(staff.department?.name || "");
  const isDeputy = /\b(pho|vice|deputy)\b/.test(pos);

  if (!isDeputy && /\b(hieu truong|rector|president)\b/.test(pos)) {
    return 0;
  }
  if (
    (/\b(pho hieu truong|vice rector|vice president|deputy rector)\b/.test(pos) &&
      /(phu trach|in charge|acting)/.test(pos)) ||
    /\bacting rector\b/.test(pos)
  ) {
    return 1;
  }
  if (
    /\b(pho hieu truong|vice rector|vice president|deputy rector)\b/.test(pos) ||
    deptSlug === "ban-lanh-dao-vien" ||
    deptSlug === "institute-board-of-management" ||
    deptName.includes("ban lanh dao")
  ) {
    return 2;
  }
  if (!isDeputy && /\b(truong khoa|truong bo mon|dean|head of faculty|head of department)\b/.test(pos)) {
    return 3;
  }
  if (
    /\b(pho truong khoa|pho khoa|pho truong bo mon|vice dean|deputy dean|deputy head|vice head)\b/.test(
      pos,
    )
  ) {
    return 4;
  }
  return 5;
}

function getGivenName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : "";
}

/** So sánh hai cán bộ theo tên gọi tiếng Việt (từ cuối của họ tên), trùng tên gọi mới xét họ tên đầy đủ. */
export function compareVietnameseStaffName(
  a: Pick<SearchableStaff, "full_name">,
  b: Pick<SearchableStaff, "full_name">,
): number {
  const nameA = a.full_name.trim();
  const nameB = b.full_name.trim();
  const givenA = getGivenName(nameA);
  const givenB = getGivenName(nameB);

  const baseDiff = VI_BASE_COLLATOR.compare(givenA, givenB);
  if (baseDiff !== 0) return baseDiff;

  const variantDiff = VI_VARIANT_COLLATOR.compare(givenA, givenB);
  if (variantDiff !== 0) return variantDiff;

  return VI_VARIANT_COLLATOR.compare(nameA, nameB);
}

export function sortStaffsForDirectory<T extends SearchableStaff>(staffs: T[]): T[] {
  return [...staffs].sort((a, b) => {
    const priorityDiff = getStaffRolePriority(a) - getStaffRolePriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    return compareVietnameseStaffName(a, b);
  });
}

export function filterStaffs<T extends SearchableStaff>(
  staffs: T[],
  filters: StaffDirectoryFilters,
): T[] {
  const query = normalize(filters.q || "");
  const research = normalize(filters.research || "");
  const matched = staffs.filter(
    (staff) =>
      (!filters.department || staff.department_id === filters.department) &&
      (!query || normalize(`${staff.full_name} ${staff.english_name || ""}`).includes(query)) &&
      (!research ||
        normalize((staff.research_interests || "").replace(/<[^>]*>/g, " ")).includes(research)),
  );
  return sortStaffsForDirectory(matched);
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
