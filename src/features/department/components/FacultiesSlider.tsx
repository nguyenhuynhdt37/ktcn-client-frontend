"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/routing";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";
import { SafeImage } from "@/shared/components/ui/safe-image";

interface FacultyItem {
  id: string | number;
  name: string;
  nameEn?: string;
  imageUrl: string;
  href: string;
}

const defaultFaculties: FacultyItem[] = [
  {
    id: 1,
    name: "Khoa Công nghệ thông tin",
    nameEn: "Faculty of Information Technology",
    imageUrl: "/images/faculties/khoa-cntt.jpg",
    href: "/co-cau-to-chuc/khoa-cntt",
  },
  {
    id: 2,
    name: "Khoa Điện tử - Tự động hóa",
    nameEn: "Faculty of Electronics & Automation",
    imageUrl: "/images/faculties/khoa-dien-tu.jpg",
    href: "/co-cau-to-chuc/khoa-dien-tu",
  },
  {
    id: 3,
    name: "Khoa Kỹ thuật Xây dựng",
    nameEn: "Faculty of Civil Engineering",
    imageUrl: "/images/faculties/khoa-xay-dung.jpg",
    href: "/co-cau-to-chuc/khoa-xay-dung",
  },
  {
    id: 4,
    name: "Khoa Cơ khí & Ô tô",
    nameEn: "Faculty of Mechanical & Automotive Engineering",
    imageUrl: "/images/faculties/khoa-co-khi.jpg",
    href: "/co-cau-to-chuc/khoa-co-khi",
  },
];

export function FacultiesSlider({ faculties = defaultFaculties }: { faculties?: FacultyItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });
  const locale = useLocale();

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  useEffect(() => {
    if (!emblaApi) return;
  }, [emblaApi]);

  return (
    <section className="py-14 md:py-20 bg-slate-50/60 border-y border-slate-100/60">
      <div className="max-w-[1360px] mx-auto px-6 relative group space-y-8">
        
        {/* Tiêu đề Section chuẩn học thuật đại học */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {locale === "en" ? "Key Faculties & Disciplines" : "Khoa Đào Tạo Mũi Nhọn"}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {locale === "en" ? "Explore our specialized faculties and training programs" : "Khám phá các khoa chuyên ngành và chương trình đào tạo"}
          </p>
        </div>

        {/* Vùng Slider */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {faculties.map((faculty) => {
              const facultyName = locale === "en" ? (faculty.nameEn || faculty.name) : faculty.name;
              return (
                <div
                  key={faculty.id}
                  className="flex-[0_0_80%] sm:flex-[0_0_45%] lg:flex-[0_0_25%] min-w-0"
                >
                  {/* Card thiết kế phẳng, ảnh đè chữ (overlay) hiện đại */}
                  <Link 
                    href={faculty.href} 
                    className="block relative aspect-[4/3] w-full overflow-hidden bg-slate-900 border border-border hover:border-border-subtle hover:shadow-sm transition-all duration-300 group/card cursor-pointer rounded-xl"
                  >
                    <SafeImage
                      src={faculty.imageUrl}
                      alt={facultyName}
                      fill
                      sizes="(max-w-640px) 80vw, (max-w-1024px) 45vw, 280px"
                      className="object-cover"
                    />
                    
                    {/* Lớp phủ gradient màu đen sang trọng */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300" />
                    
                    {/* Nội dung chữ đè bên dưới */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1.5 flex flex-col justify-end h-1/2">
                      <h3 className="text-base sm:text-lg font-bold text-white leading-normal group-hover/card:text-brand-yellow transition-colors duration-200">
                        {facultyName}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1 group-hover/card:translate-x-1 transition-transform duration-200">
                        <span>{locale === "en" ? "Explore" : "Khám phá"}</span>
                        <span>→</span>
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nút Điều khiển slider phẳng tối giản */}
        <button
          onClick={scrollPrev}
          className="absolute -left-2 top-[58%] -translate-y-1/2 flex h-9 w-9 items-center justify-center bg-white border border-border rounded-full text-slate-600 hover:text-brand-darkred hover:border-border-subtle transition-all duration-200 opacity-0 group-hover:opacity-100 z-10 cursor-pointer shadow-sm"
          aria-label="Previous faculty slide"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={scrollNext}
          className="absolute -right-2 top-[58%] -translate-y-1/2 flex h-9 w-9 items-center justify-center bg-white border border-border rounded-full text-slate-600 hover:text-brand-darkred hover:border-border-subtle transition-all duration-200 opacity-0 group-hover:opacity-100 z-10 cursor-pointer shadow-sm"
          aria-label="Next faculty slide"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}
