import { StaffItem } from "../types/lecturer.types";
import { SafeImage } from "@/shared/components/ui/safe-image";
import { Link } from "@/i18n/routing";
import { Building2 } from "lucide-react";

interface StaffHeroProps {
  staff: StaffItem;
  displayName: string;
  credentials: string;
}

export function StaffHero({ staff, displayName, credentials }: StaffHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-blue text-white" style={{ backgroundColor: "#1b4965" }}>
      {/* Background Image */}
      <SafeImage
        src="/images/about/set-it.jpg"
        alt="Không gian học tập tại Trường Kỹ thuật và Công nghệ"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      {/* Deep overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/80 via-brand-blue/90 to-brand-blue z-10" />

      {/* Container */}
      <div className="site-container relative z-20 grid min-h-[46dvh] items-end gap-7 py-10 sm:grid-cols-[220px_1fr] sm:py-14">
        {/* Profile Portrait card */}
        <div className="relative aspect-[4/5] w-40 overflow-hidden rounded-xl border border-white/20 bg-white/10 sm:w-full shadow-md">
          <SafeImage
            src={staff.avatar_object_key || "/images/no-image-dhv.jpg"}
            alt={displayName}
            fill
            className="object-cover"
            sizes="220px"
            priority
          />
        </div>

        {/* Profile Info */}
        <div className="pb-1">
          {staff.position?.name && (
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/80">
              {staff.position.name}
            </p>
          )}
          <h1 className="mt-2 max-w-4xl text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl drop-shadow-sm">
            {displayName}
          </h1>
          {credentials && (
            <p className="mt-3 text-base sm:text-lg font-bold text-slate-200">
              {credentials}
            </p>
          )}
          {staff.department && (
            <div className="mt-4 pt-1">
              <Link
                href={
                  staff.department.slug === "ban-lanh-dao-vien" || staff.department.slug === "institute-board-of-management"
                    ? "/gioi-thieu/can-bo"
                    : staff.department.slug.startsWith("van-phong")
                      ? "/gioi-thieu"
                      : staff.department.slug.startsWith("khoa-") || staff.department.slug.includes("khoa") || staff.department.slug.startsWith("faculty-")
                        ? { pathname: "/khoa/[slug]", params: { slug: staff.department.slug } }
                        : { pathname: "/bo-mon/[slug]", params: { slug: staff.department.slug } }
                }
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 text-xs sm:text-sm font-bold text-white hover:bg-white hover:text-brand-blue hover:border-white transition-all duration-200"
              >
                <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{staff.department.name}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
