import { Link } from "@/i18n/routing";
import { StaffPortrait } from "./StaffPortrait";
import { getStaffQualifications } from "../utils/staff-directory";
import type { StaffItem } from "../types/lecturer.types";

type StaffCardItem = Pick<
  StaffItem,
  "id" | "full_name" | "slug" | "avatar_object_key" | "academic_title" | "degree"
> & {
  english_name?: string | null;
  position_name?: string | null;
  position?: StaffItem["position"];
  department?: StaffItem["department"];
};

interface StaffGridProps {
  staffs: StaffCardItem[];
  locale: string;
  showDepartment?: boolean;
}

export function StaffGrid({ staffs, locale, showDepartment = false }: StaffGridProps) {
  return (
    <ul
      className={`grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 ${showDepartment ? "xl:grid-cols-5" : ""}`}
    >
      {staffs.map((staff, index) => {
        const name = locale === "en" ? staff.english_name || staff.full_name : staff.full_name;
        const qualifications = getStaffQualifications(staff, locale);
        const position = staff.position_name || staff.position?.name;
        return (
          <li key={staff.id} className="min-w-0">
            <Link
              href={{ pathname: "/nhan-su/[slug]", params: { slug: staff.slug } }}
              className="group border-border hover:border-brand-darkred focus-visible:outline-brand-darkred flex h-full flex-col border bg-white p-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                <StaffPortrait
                  name={name}
                  src={staff.avatar_object_key}
                  className="object-cover object-top"
                  sizes={
                    showDepartment
                      ? "(max-width: 767px) 45vw, (max-width: 1279px) 28vw, 240px"
                      : "(max-width: 767px) 45vw, (max-width: 1023px) 28vw, 260px"
                  }
                  priority={index < 4}
                />
              </div>
              <div className="flex flex-1 flex-col px-1 pt-4 pb-2 text-center">
                <h3 className="group-hover:text-brand-darkred text-sm leading-6 font-semibold text-slate-900 sm:text-base">
                  {qualifications && <span>{qualifications} </span>}
                  {name}
                </h3>
                {position && (
                  <p className="text-brand-blue mt-3 border-t border-slate-100 pt-3 text-xs leading-5 font-semibold sm:text-sm">
                    {position}
                  </p>
                )}
                {showDepartment && staff.department?.name && (
                  <p className="mt-2 text-xs leading-5 text-slate-500">{staff.department.name}</p>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
