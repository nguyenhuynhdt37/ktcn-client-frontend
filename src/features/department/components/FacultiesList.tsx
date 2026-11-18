"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/routing";
import { SafeImage } from "@/shared/components/ui/safe-image";
import { Breadcrumb } from "@/shared/components/ui/breadcrumb";
import { PortalDepartment } from "../types/department.types";
import { GraduationCap, Users, BookOpen, ArrowRight, Building2 } from "lucide-react";
import { ConsultationCallout } from "@/features/consultation/components/ConsultationCallout";

interface FacultiesListProps {
  faculties: PortalDepartment[];
  locale: string;
}

export function FacultiesList({ faculties, locale }: FacultiesListProps) {
  const isEn = locale === "en";

  // Tính toán các số liệu thống kê tổng quát của trường từ dữ liệu khoa
  const totalStaffs = useMemo(() => {
    return faculties.reduce((acc, f) => acc + (f.staff_count || 0), 0);
  }, [faculties]);

  const statsItems = useMemo(() => {
    return [
      {
        value: `${faculties.length}+`,
        label: isEn ? "Academic Faculties" : "Khoa chuyên ngành",
        icon: Building2,
      },
      {
        value: `${totalStaffs}+`,
        label: isEn ? "Elite Professors & Lecturers" : "Cán bộ, giảng viên tinh hoa",
        icon: Users,
      },
      {
        value: "95%",
        label: isEn ? "Employment Rate" : "Tỷ lệ có việc làm sau tốt nghiệp",
        icon: GraduationCap,
      },
      {
        value: "20.000+",
        label: isEn ? "Successful Alumni" : "Cựu sinh viên thành đạt",
        icon: BookOpen,
      },
    ];
  }, [faculties.length, totalStaffs, isEn]);

  // Breadcrumbs items
  const breadcrumbItems = useMemo(() => {
    return [
      { name: isEn ? "Home" : "Trang chủ", href: "/" },
      { name: isEn ? "About Us" : "Giới thiệu", href: "/gioi-thieu" },
      { name: isEn ? "Faculties" : "Các khoa đào tạo" },
    ];
  }, [isEn]);

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col justify-between">
      <div>
        {/* 1. Hero Banner Section */}
        <section className="relative isolate overflow-hidden bg-[#1b4965] text-white">
          <SafeImage
            src="/images/about/set-it.jpg"
            alt={isEn ? "Faculties & Programs" : "Các khoa đào tạo"}
            fill
            priority
            className="object-cover opacity-25"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1b4965]/90 via-[#1b4965]/95 to-[#1b4965] z-10" />

          <div className="site-container relative z-20 flex min-h-[30dvh] items-end pb-8 sm:pb-12 pt-16">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 bg-white/10 border border-white/20 px-3 py-1 rounded-md">
                {isEn ? "Academic Structure" : "Hệ thống đào tạo"}
              </span>
              <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl drop-shadow-sm">
                {isEn ? "Faculties & Programs" : "Các khoa đào tạo chuyên ngành"}
              </h1>
              <p className="mt-3 max-w-2xl text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
                {isEn
                  ? "Explore our specialized departments, cutting-edge laboratories, and dynamic study paths designed for future innovators."
                  : "Trường hội tụ các khoa chuyên môn mũi nhọn, đi đầu trong nghiên cứu khoa học và chuyển giao công nghệ, cung cấp nguồn nhân lực chất lượng cao đáp ứng kỷ nguyên số."}
              </p>
            </div>
          </div>
        </section>

        {/* 2. Breadcrumbs Section */}
        <div className="bg-white border-b border-slate-200/80">
          <div className="site-container py-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        {/* 3. Quick Stats Section */}
        <section className="py-10 bg-white border-b border-slate-200/50">
          <div className="site-container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              {statsItems.map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-4 border border-slate-100/80 rounded-xl bg-slate-50/30"
                >
                  <div className="p-2.5 bg-brand-blue/5 rounded-lg mb-3">
                    <stat.icon className="h-5 w-5 text-brand-blue" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Faculties Grid Section */}
        <section className="py-16 md:py-20">
          <div className="site-container">
            <div className="mb-10 text-center md:text-left max-w-3xl">
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight">
                {isEn ? "Specialized Academic Units" : "Đơn vị học thuật thành viên"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                {isEn
                  ? "Click on each faculty to explore details, majors, laboratories, faculty members, and research programs."
                  : "Vui lòng chọn khoa để xem thông tin chi tiết về các ngành đào tạo, đội ngũ giảng viên, phòng thí nghiệm và hoạt động khoa học nổi bật."}
              </p>
            </div>

            {faculties.length === 0 ? (
              <div className="text-center py-20 bg-white border border-slate-200/80 rounded-xl p-8 max-w-md mx-auto shadow-sm space-y-4">
                <div className="p-3 bg-slate-100 text-slate-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {isEn ? "No faculties available" : "Chưa có danh sách Khoa"}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isEn
                    ? "Information is being updated. Please check back later."
                    : "Thông tin các khoa đang được cập nhật. Vui lòng quay lại sau."}
                </p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {faculties.map((faculty) => {
                  const detailUrl = `/khoa/${faculty.slug}`;
                  const coverImage = faculty.thumbnail_object_key || faculty.banner_object_key || "/images/about/set-lab.jpg";

                  return (
                    <article
                      key={faculty.id}
                      className="group flex flex-col justify-between border border-slate-200/60 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-brand-darkred/40 transition-all duration-300 relative"
                    >
                      <div>
                        {/* Cover Image Area */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
                          <SafeImage
                            src={coverImage}
                            alt={faculty.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                          />
                          {/* Image Gradient Layer */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent z-10" />

                          {/* Code Badge */}
                          {faculty.code && (
                            <div className="absolute top-4 left-4 z-20">
                              <span className="bg-brand-blue/90 text-white backdrop-blur-sm text-[9px] font-bold px-2.5 py-1 rounded border border-white/10 uppercase tracking-wider">
                                {faculty.code}
                              </span>
                            </div>
                          )}

                          {/* Staff Count Badge on Image bottom */}
                          {faculty.staff_count > 0 && (
                            <div className="absolute bottom-3 right-4 z-20 bg-slate-950/70 text-white backdrop-blur-sm text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1.5">
                              <Users size={11} className="text-slate-300" />
                              <span>
                                {faculty.staff_count} {isEn ? "Lecturers" : "Cán bộ"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Inner Content */}
                        <div className="p-6">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-darkred transition-colors duration-150 leading-snug tracking-tight min-h-[48px] flex items-center">
                            {faculty.name}
                          </h3>
                          {faculty.description && (
                            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3 font-normal mt-3">
                              {faculty.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-6 pt-0 mt-auto border-t border-slate-100/80">
                        <div className="pt-4 flex items-center justify-between text-xs font-bold">
                          {faculty.office ? (
                            <span className="text-slate-600 font-medium truncate max-w-[150px]">
                              {faculty.office}
                            </span>
                          ) : (
                            <span />
                          )}
                          <Link
                            href={detailUrl}
                            className="inline-flex items-center gap-1 text-brand-darkred hover:underline group/btn"
                          >
                            <span>{isEn ? "Explore Faculty" : "Khám phá khoa"}</span>
                            <ArrowRight size={13} className="transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 5. Consultation Callout (CTA) */}
      <ConsultationCallout bgClass="bg-brand-darkred" borderClass="border-brand-darkred/15" className="!py-12" />
    </div>
  );
}
