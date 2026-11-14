import { Link } from "@/i18n/routing";
import { StaffPortrait } from "@/features/lecturer/components/StaffPortrait";
import { getStaffQualifications } from "@/features/lecturer/utils/staff-directory";
import type { DepartmentOverview } from "../types/department.types";

type LeaderItem = DepartmentOverview["staffs"][number];

interface LeadershipGroupsProps {
  staffs: LeaderItem[];
  locale: string;
}

const LEADERSHIP_SLUGS = ["ban-lanh-dao-vien", "institute-board-of-management"];

export function isLeadershipUnit(slug: string): boolean {
  return LEADERSHIP_SLUGS.includes(slug);
}

/** Bỏ dấu + lowercase để so khớp chức vụ ổn định. */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}

/** Xếp nhóm: 0 = Hiệu trưởng, 1 = Phó Hiệu trưởng, 2 = khác. */
function getGroup(position: string | null | undefined, isEn: boolean) {
  const p = normalize(position ?? "");
  const isDeputy = /(^|\b)(pho hieu truong|vice rector|vice president|deputy)/.test(p);
  const isHead = !isDeputy && /(hieu truong|rector|president)/.test(p);
  if (isHead) return { order: 0, label: isEn ? "Rector" : "Hiệu trưởng" };
  if (isDeputy) return { order: 1, label: isEn ? "Vice Rectors" : "Phó Hiệu trưởng" };
  return { order: 2, label: isEn ? "Other Leaders" : "Thành viên khác" };
}

export function LeadershipGroups({ staffs, locale }: LeadershipGroupsProps) {
  const isEn = locale === "en";

  const groups = new Map<number, { label: string; items: LeaderItem[] }>();
  for (const staff of staffs) {
    const g = getGroup(staff.position_name, isEn);
    const bucket = groups.get(g.order) ?? { label: g.label, items: [] };
    bucket.items.push(staff);
    groups.set(g.order, bucket);
  }
  const ordered = [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);

  return (
    <div className="space-y-12">
      {ordered.map((group) => (
        <div key={group.label}>
          {/* Tiêu đề nhóm: chữ giữa, hai đường kẻ hai bên (giống SOICT) */}
          <div className="mb-8 flex items-center gap-4">
            <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
            <h3 className="text-sm font-bold tracking-[0.2em] text-slate-700 uppercase">
              {group.label}
            </h3>
            <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
          </div>

          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-8">
            {group.items.map((staff, index) => {
              const name = staff.full_name;
              const qualifications = getStaffQualifications(staff, locale);
              return (
                <li key={staff.id} className="w-full max-w-[340px] min-w-0 sm:w-[300px] lg:w-[340px]">
                  <Link
                    href={{ pathname: "/nhan-su/[slug]", params: { slug: staff.slug } }}
                    className="group border-border hover:border-brand-darkred focus-visible:outline-brand-darkred flex h-full flex-col border bg-white p-2.5 shadow-sm transition-all hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden bg-slate-100">
                      <StaffPortrait
                        name={name}
                        src={staff.avatar_object_key}
                        className="object-cover object-top"
                        sizes="(max-width: 639px) 90vw, 340px"
                        priority={index < 3}
                      />
                    </div>
                    <div className="flex flex-1 flex-col px-3 pt-5 pb-3 text-center">
                      <h4 className="group-hover:text-brand-darkred text-base leading-6 font-bold text-slate-900 sm:text-lg">
                        {qualifications && <span>{qualifications} </span>}
                        {name}
                      </h4>
                      {staff.position_name && (
                        <>
                          <hr className="mx-auto my-3 w-12 border-slate-300" />
                          {/* Dòng chức vụ: không bó hẹp, tự cân dòng để không đứt 2 dòng lẻ */}
                          <p className="text-brand-blue text-sm leading-6 font-semibold text-balance sm:text-[15px]">
                            {staff.position_name}
                          </p>
                        </>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
