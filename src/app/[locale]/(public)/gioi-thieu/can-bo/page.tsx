import { getTranslations, setRequestLocale } from "next-intl/server";
import { Search, Users } from "lucide-react";
import { getPathname, Link } from "@/i18n/routing";
import { lecturerService } from "@/features/lecturer/services/lecturerService";
import { StaffGrid } from "@/features/lecturer/components/StaffGrid";
import { filterStaffs } from "@/features/lecturer/utils/staff-directory";
import { Breadcrumb } from "@/shared/components/ui/breadcrumb";
import { constructMetadata } from "@/shared/lib/seo";

interface StaffDirectoryPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string | string[];
    department?: string | string[];
    research?: string | string[];
  }>;
}

export async function generateMetadata({ params }: StaffDirectoryPageProps) {
  const { locale } = await params;
  return constructMetadata({
    title: locale === "en" ? "Faculty and Staff" : "Danh sách cán bộ",
    description:
      locale === "en"
        ? "Find faculty and staff by name, department and research interests at the College of Engineering and Technology, Vinh University."
        : "Tra cứu cán bộ, giảng viên Trường Kỹ thuật và Công nghệ, Đại học Vinh theo họ tên, đơn vị và lĩnh vực nghiên cứu.",
    locale,
    alternatesLanguages: { vi: "gioi-thieu/can-bo", en: "about/staff" },
  });
}

function first(value: string | string[] | undefined) {
  return ((Array.isArray(value) ? value[0] : value) || "").slice(0, 200);
}

export default async function StaffDirectoryPage({
  params,
  searchParams,
}: StaffDirectoryPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === "en";
  const t = await getTranslations({ locale, namespace: "common" });
  const query = await searchParams;
  const filters = {
    q: first(query.q).trim(),
    department: first(query.department),
    research: first(query.research).trim(),
  };
  const staffs = await lecturerService.getStaffDirectory(locale);
  const filtered = filterStaffs(staffs || [], filters);
  const departments = [
    ...new Map(
      (staffs || []).flatMap((staff) =>
        staff.department?.name ? [[staff.department_id, staff.department.name] as const] : [],
      ),
    ).entries(),
  ].sort((a, b) => a[1].localeCompare(b[1], isEn ? "en" : "vi"));
  const hasFilters = Boolean(filters.q || filters.department || filters.research);
  const directoryPath = getPathname({ locale: isEn ? "en" : "vi", href: "/gioi-thieu/can-bo" });
  const controlClass =
    "min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-brand-blue focus:outline-2 focus:outline-offset-2 focus:outline-brand-blue";

  return (
    <div className="bg-white py-8 sm:py-12">
      <div className="site-container space-y-8">
        <Breadcrumb
          items={[
            { name: t("home"), href: "/" },
            { name: isEn ? "About" : "Giới thiệu", href: "/gioi-thieu" },
            { name: isEn ? "Staff" : "Cán bộ", href: "/gioi-thieu/can-bo" },
          ]}
        />
        <header className="border-b border-slate-200 pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {isEn ? "Faculty and Staff" : "Danh sách cán bộ"}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            {isEn
              ? "Find a staff member and explore their profile, contact details and research interests."
              : "Tìm kiếm cán bộ, giảng viên và tra cứu hồ sơ, thông tin liên hệ, lĩnh vực nghiên cứu."}
          </p>
        </header>

        {staffs === null ? (
          <div
            role="alert"
            className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm leading-6 text-slate-700"
          >
            <p>
              {isEn
                ? "The staff directory could not be loaded. Please try again."
                : "Chưa tải được danh sách cán bộ. Vui lòng thử lại."}
            </p>
            <a
              href={directoryPath}
              className="text-brand-darkred mt-3 inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
            >
              {isEn ? "Try again" : "Tải lại danh sách"}
            </a>
          </div>
        ) : (
          <>
            <form
              action={directoryPath}
              method="get"
              className="border-border grid gap-4 rounded-lg border bg-slate-50 p-4 sm:p-5 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
            >
              <div className="space-y-2">
                <label
                  htmlFor="staff-department"
                  className="block text-sm font-semibold text-slate-700"
                >
                  {isEn ? "Department" : "Đơn vị"}
                </label>
                <select
                  id="staff-department"
                  name="department"
                  defaultValue={filters.department}
                  className={controlClass}
                >
                  <option value="">
                    {isEn ? "All departments" : "Tất cả khoa, bộ môn, đơn vị"}
                  </option>
                  {departments.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="staff-research"
                  className="block text-sm font-semibold text-slate-700"
                >
                  {isEn ? "Research interests" : "Lĩnh vực nghiên cứu"}
                </label>
                <input
                  id="staff-research"
                  name="research"
                  type="search"
                  maxLength={200}
                  defaultValue={filters.research}
                  placeholder={isEn ? "e.g. artificial intelligence" : "Ví dụ: trí tuệ nhân tạo"}
                  className={controlClass}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="staff-name" className="block text-sm font-semibold text-slate-700">
                  {isEn ? "Staff name" : "Tên cán bộ"}
                </label>
                <input
                  id="staff-name"
                  name="q"
                  type="search"
                  maxLength={200}
                  defaultValue={filters.q}
                  placeholder={isEn ? "Enter a name" : "Nhập họ tên cán bộ"}
                  className={controlClass}
                />
              </div>
              <button
                type="submit"
                className="bg-brand-blue hover:bg-brand-darkred focus-visible:outline-brand-blue inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <Search size={17} aria-hidden="true" />
                {isEn ? "Search" : "Tìm kiếm"}
              </button>
            </form>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <p role="status" className="text-slate-600">
                {isEn
                  ? `${filtered.length} of ${staffs.length} staff members`
                  : `Hiển thị ${filtered.length} / ${staffs.length} cán bộ`}
              </p>
              {hasFilters && (
                <Link
                  href="/gioi-thieu/can-bo"
                  className="text-brand-darkred inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
                >
                  {isEn ? "Clear filters" : "Xóa bộ lọc"}
                </Link>
              )}
            </div>
            {filtered.length > 0 ? (
              <StaffGrid staffs={filtered} locale={locale} showDepartment />
            ) : (
              <div className="border-y border-slate-200 py-16 text-center">
                <Users className="mx-auto h-9 w-9 text-slate-400" aria-hidden="true" />
                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                  {isEn
                    ? hasFilters
                      ? "No matching staff"
                      : "The staff directory is being updated"
                    : hasFilters
                      ? "Không tìm thấy cán bộ phù hợp"
                      : "Danh sách cán bộ đang được cập nhật"}
                </h2>
                {hasFilters && (
                  <p className="mt-2 text-sm text-slate-500">
                    {isEn
                      ? "Try another name or clear your filters."
                      : "Thử từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh sách."}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
