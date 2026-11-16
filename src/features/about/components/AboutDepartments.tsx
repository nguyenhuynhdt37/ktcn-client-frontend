import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { SafeImage } from "@/shared/components/ui/safe-image";
import { Users, Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { departmentService } from "@/features/department";

export async function AboutDepartments() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "about" });
  const isEn = locale === "en";

  // Fetch departments (faculties) from the CMS API
  const departments = await departmentService.getDepartments({
    unit_type: "faculty",
    lang: locale
  }) || [];

  // Sort departments by sort_order
  const sortedDepts = [...departments].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section className="py-14 md:py-20 bg-slate-50/50 border-y border-slate-100/60">
      <div className="max-w-[1360px] mx-auto px-6 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-brand-darkred bg-brand-darkred/6 rounded-full">
            {t("departments_heading")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {t("departments_heading")}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            {t("departments_subtext")}
          </p>
        </div>

        {/* Empty State */}
        {sortedDepts.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-12">
            {isEn ? "No departments available." : "Hiện chưa có thông tin các khoa."}
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDepts.map((dept) => {
              const detailUrl = `/khoa/${dept.slug}`;

              return (
                <div
                  key={dept.id}
                  className="group border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image Cover */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <SafeImage
                      src={dept.thumbnail_object_key || "/images/faculties/khoa-cntt.jpg"}
                      alt={dept.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                    />
                    
                    {/* Staff Count Badge */}
                    {dept.staff_count > 0 && (
                      <div className="absolute top-3 left-3 bg-slate-900/70 text-white backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                        <Users size={12} />
                        <span>
                          {dept.staff_count} {isEn ? "Staff" : "Nhân sự"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-brand-darkred transition-colors duration-150">
                        {dept.name}
                      </h3>
                      {dept.description && (
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                          {dept.description}
                        </p>
                      )}
                    </div>

                    {/* Contact Info & Action Link */}
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <div className="space-y-2 text-xs text-slate-600 font-medium">
                        {dept.office && (
                          <div className="flex items-start gap-2">
                            <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{dept.office}</span>
                          </div>
                        )}
                        {dept.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-slate-400 shrink-0" />
                            <span>{dept.phone}</span>
                          </div>
                        )}
                        {dept.email && (
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-slate-400 shrink-0" />
                            <span className="truncate">{dept.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Action button */}
                      <Link
                        href={detailUrl as any}
                        className="pt-2 flex items-center justify-between text-xs font-bold text-brand-darkred hover:text-brand-darkred-dark group/link"
                      >
                        <span>{isEn ? "Explore Department" : "Khám phá khoa"}</span>
                        <ArrowRight size={14} className="group-hover/link:translate-x-0.5 transition-transform duration-150" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
