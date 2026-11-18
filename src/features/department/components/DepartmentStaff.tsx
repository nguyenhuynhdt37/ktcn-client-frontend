import { StaffItem } from "@/features/lecturer";
import { SafeImage } from "@/shared/components/ui/safe-image";
import { Link } from "@/i18n/routing";
import { Users } from "lucide-react";

interface DepartmentStaffProps {
  staffs: Array<
    Pick<
      StaffItem,
      | "id"
      | "full_name"
      | "slug"
      | "avatar_object_key"
      | "academic_title"
      | "degree"
      | "biography"
      | "research_interests"
    > & {
      position_name?: string | null;
    }
  >;
  isEn: boolean;
}

export function DepartmentStaff({ staffs, isEn }: DepartmentStaffProps) {
  if (staffs.length === 0) {
    return (
      <section className="py-14 md:py-20 bg-slate-50/50">
        <div className="max-w-[1360px] mx-auto px-6">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center max-w-xl mx-auto shadow-sm">
            <Users className="mx-auto h-10 w-10 text-brand-blue/80" aria-hidden="true" />
            <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900">
              {isEn ? "Profiles are being reviewed" : "Hồ sơ đang được rà soát"}
            </h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500">
              {isEn
                ? "The official staff list will appear here after the unit completes verification."
                : "Danh sách chính thức sẽ hiển thị tại đây sau khi đơn vị hoàn tất kiểm tra thông tin."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Duplicate items to ensure seamless loop
  const duplicatedStaffs = staffs.length < 5
    ? [...staffs, ...staffs, ...staffs, ...staffs]
    : [...staffs, ...staffs];

  return (
    <section className="py-14 md:py-20 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-[1360px] mx-auto px-6 space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-darkred bg-brand-darkred/5 px-2.5 py-1 rounded">
            {isEn ? "Faculty Members" : "Đội ngũ chuyên gia"}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {isEn ? "Faculty and Staff" : "Đội ngũ cán bộ, giảng viên"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
            {isEn
              ? "Profiles are published after the unit has reviewed their academic information."
              : "Hồ sơ cán bộ được chuẩn hóa và hiển thị công khai sau khi đơn vị hoàn tất kiểm định."}
          </p>
        </div>

        {/* Continuous Infinite Scrolling Row restricted to container width */}
        <div className="relative overflow-hidden group/marquee py-4 rounded-2xl">
          {/* Gradient fade edges inside the container */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-slate-50/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-slate-50/90 to-transparent z-10 pointer-events-none" />

          {/* Marquee Container */}
          <div
            className="flex w-max gap-6 animate-marquee-left group-hover/marquee:[animation-play-state:paused]"
            style={{ animationDuration: `${Math.max(20, staffs.length * 6)}s` }}
          >
            {duplicatedStaffs.map((staff, i) => {
              const credentials = [staff.academic_title, staff.degree]
                .filter(Boolean)
                .join(". ");

              return (
                <div
                  key={`${staff.id}-${i}`}
                  className="w-[180px] sm:w-[220px] shrink-0"
                >
                  <Link
                    href={{ pathname: "/nhan-su/[slug]", params: { slug: staff.slug } }}
                    className="group flex flex-col justify-between border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 h-full"
                  >
                    {/* Portrait Container - aspect-[4/5] vertical portrait style */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
                      <SafeImage
                        src={staff.avatar_object_key || "/images/no-image-dhv.jpg"}
                        alt={staff.full_name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 180px, 220px"
                      />
                    </div>

                    {/* Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1 text-center">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-darkred transition-colors duration-150 leading-snug line-clamp-1">
                          {staff.full_name}
                        </h3>
                        {credentials && (
                          <p className="text-xs font-bold text-brand-blue line-clamp-1 mt-0.5">
                            {credentials}
                          </p>
                        )}
                        {staff.position_name && (
                          <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider line-clamp-1 mt-1">
                            {staff.position_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
