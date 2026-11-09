"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Mail, Globe, BookOpen } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { sanitizeRichHtml } from "@/shared/lib/security";

interface LeaderItem {
  id: string | number;
  name: string;
  nameEn?: string;
  title?: string; // E.g., PGS. TS., TS.
  titleEn?: string;
  role: string; // Role/Affiliation in Vietnamese
  roleEn?: string; // Role/Affiliation in English
  bio?: string[]; // Bio paragraphs in Vietnamese
  bioEn?: string[]; // Bio paragraphs in English
  biographyHtml?: string; // HTML biography from Backend
  imageUrl: string;
  email?: string;
  website?: string;
  googleScholar?: string;
}

const defaultLeaders: LeaderItem[] = [
  {
    id: 1,
    name: "Nguyễn Huy Bằng",
    nameEn: "Nguyen Huy Bang",
    title: "PGS. TS.",
    titleEn: "Assoc. Prof. Dr.",
    role: "Hiệu trưởng Trường Đại học Vinh · Chủ tịch Hội đồng KH&ĐT",
    roleEn: "Rector of Vinh University · Chairman of Science & Training Council",
    imageUrl: "/images/leaders/leader-bang.png",
    email: "nhbang@vinhuni.edu.vn",
    website: "https://vinhuni.edu.vn",
    googleScholar: "https://scholar.google.com",
    bio: [
      "PGS. TS. Nguyễn Huy Bằng tốt nghiệp Tiến sĩ chuyên ngành Vật lý kỹ thuật. Ông có nhiều năm giảng dạy, nghiên cứu và giữ các chức vụ quản lý quan trọng tại Trường Đại học Vinh.",
      "Với định hướng phát triển trường thành đại học thông minh, ông đặc biệt quan tâm tới việc xây dựng **Trường Kỹ thuật và Công nghệ** trở thành trụ cột đào tạo nguồn nhân lực chất lượng cao trong các lĩnh vực kỹ thuật, công nghệ thông tin, AI và tự động hóa cho khu vực miền Trung và cả nước.",
    ],
    bioEn: [
      "Assoc. Prof. Dr. Nguyen Huy Bang graduated with a PhD in Engineering Physics. He has many years of teaching, researching and holding key management positions at Vinh University.",
      "With the orientation of developing the school into a smart university, he is particularly interested in building the **College of Engineering and Technology** as a pillar of high-quality training in engineering, IT, AI and automation.",
    ],
  },
  {
    id: 2,
    name: "Lại Tuấn Dũng",
    nameEn: "Lai Tuan Dung",
    title: "TS.",
    titleEn: "Dr.",
    role: "Giảng viên thỉnh giảng Khoa CNTT & AI · Đại học Swinburne, Úc",
    roleEn: "Visiting Lecturer, Faculty of IT & AI · Swinburne University, Australia",
    imageUrl: "/images/leaders/leader-dung.png",
    email: "ltdung@swin.edu.au",
    website: "https://swinburne.edu.au",
    googleScholar: "https://scholar.google.com",
    bio: [
      "Hiện tại Dũng đang sống và làm việc tại Úc. Dũng từng là học sinh chuyên toán tại **THPT Hà Nội - Amsterdam**. Sau lớp 12, Dũng bắt đầu du học ngành Khoa học dữ liệu tại Đại học Swinburne, Australia.",
      "21 tuổi, Dũng nhận học bổng Tiến sĩ và nghiên cứu tại **Viện A2I2** (Applied Artificial Intelligence Institute), đồng thời giảng dạy tại 3 trường đại học Deakin, Monash và Swinburne. 26 tuổi, Dũng nhận bằng Tiến Sĩ và trở thành **giảng viên chính thức** Khoa CNTT và AI tại Đại học Swinburne.",
    ],
    bioEn: [
      "Currently Dung is living and working in Australia. He was a mathematics major student at **Hanoi - Amsterdam High School**. After grade 12, Dung began studying Data Science at Swinburne University, Australia.",
      "At 21, Dung received a PhD scholarship and researched at the **A2I2 Institute** (Applied Artificial Intelligence Institute), while teaching at Deakin, Monash, and Swinburne Universities. At 26, he completed his PhD and became an **official lecturer** in IT & AI at Swinburne.",
    ],
  },
];

export function LeaderSlider({ leaders = defaultLeaders }: { leaders?: LeaderItem[] }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 25 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="relative overflow-hidden border-y border-slate-200/60 bg-slate-50/50 py-16 text-slate-800">
      {/* Subtle ambient light accents (soft brand-darkred & brand-blue glows) */}
      <div className="bg-brand-darkred/[0.02] pointer-events-none absolute top-[-10%] left-[-10%] h-[50%] w-[35%] rounded-none blur-[120px]" />
      <div className="bg-brand-blue/[0.02] pointer-events-none absolute right-[-10%] bottom-[-10%] h-[50%] w-[35%] rounded-none blur-[120px]" />

      <div className="relative mx-auto max-w-[1360px] px-6">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {leaders.map((leader) => {
              const name = locale === "en" ? leader.nameEn || leader.name : leader.name;
              const title = locale === "en" ? leader.titleEn || leader.title : leader.title;
              const role = locale === "en" ? leader.roleEn || leader.role : leader.role;
              const bioParagraphs = locale === "en" ? leader.bioEn || leader.bio : leader.bio;
              const badgeText = locale === "en" ? "INTRODUCTION" : "GIỚI THIỆU LÃNH ĐẠO";

              return (
                <div key={leader.id} className="min-w-0 flex-[0_0_100%]">
                  <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-16">
                    {/* Left side: Photo with rounded-none frame */}
                    <div className="flex justify-center lg:col-span-5">
                      <div className="group/photo relative aspect-[4/5] w-full max-w-[380px] overflow-hidden rounded-xl border border-border bg-white p-2 shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative h-full w-full overflow-hidden bg-slate-50">
                          <Image
                            src={leader.imageUrl}
                            alt={name}
                            fill
                            sizes="(max-w-768px) 100vw, 400px"
                            className="object-cover transition-transform duration-700 ease-out group-hover/photo:scale-105"
                            priority={leader.id === 1}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right side: Detailed Bio & Info */}
                    <div className="space-y-6 text-left lg:col-span-7">
                      <span className="bg-brand-darkred/5 text-brand-darkred inline-block rounded-md px-3 py-1 text-sm font-semibold">
                        {badgeText}
                      </span>

                      {/* Name & Academic Titles */}
                      <div className="space-y-1.5">
                        <h3 className="text-3xl leading-tight font-black tracking-tight text-slate-800 sm:text-4xl md:text-5xl">
                          <span className="mr-3 font-medium text-slate-400">{title}</span>
                          {name}
                        </h3>
                        <p className="text-brand-darkred text-sm font-semibold tracking-wide sm:text-base">
                          {role}
                        </p>
                      </div>

                      {/* Bio Details */}
                      {leader.biographyHtml ? (
                        <div
                          className="biography-html-content space-y-4 text-sm leading-relaxed font-normal text-slate-600 sm:text-[15px]"
                          dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(leader.biographyHtml) }}
                        />
                      ) : (
                        <div className="space-y-4 text-sm leading-relaxed font-normal text-slate-600 sm:text-[15px]">
                          {bioParagraphs?.map((paragraph, index) => {
                            const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                            return (
                              <p key={index}>
                                {parts.map((part, partIdx) => {
                                  if (part.startsWith("**") && part.endsWith("**")) {
                                    return (
                                      <strong key={partIdx} className="font-bold text-slate-900">
                                        {part.slice(2, -2)}
                                      </strong>
                                    );
                                  }
                                  return part;
                                })}
                              </p>
                            );
                          })}
                        </div>
                      )}

                      {/* Social/Contact Buttons (rounded-none, hover brand color) */}
                      <div className="flex flex-wrap gap-3.5 pt-4">
                        {leader.email && (
                          <a
                            href={`mailto:${leader.email}`}
                            className="hover:border-border-subtle hover:bg-brand-darkred/5 hover:text-brand-darkred inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all duration-200"
                          >
                            <Mail size={14} className="text-brand-blue" />
                            <span>Email</span>
                          </a>
                        )}
                        {leader.website && (
                          <a
                            href={leader.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:border-border-subtle hover:bg-brand-darkred/5 hover:text-brand-darkred inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all duration-200"
                          >
                            <Globe size={14} className="text-brand-blue" />
                            <span>Website</span>
                          </a>
                        )}
                        {leader.googleScholar && (
                          <a
                            href={leader.googleScholar}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:border-border-subtle hover:bg-brand-darkred/5 hover:text-brand-darkred inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all duration-200"
                          >
                            <BookOpen size={14} className="text-brand-blue" />
                            <span>Google Scholar</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel controls */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 lg:mt-12">
          {/* Bullet indicators (rounded-none rectangles) */}
          <div className="flex gap-2">
            {leaders.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  selectedIndex === index ? "bg-brand-darkred w-8" : "w-3 bg-slate-200"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation arrows (rounded-none, brand color hover) */}
          <div className="flex gap-3">
            <button
              onClick={scrollPrev}
              className="hover:text-brand-darkred hover:border-border-subtle flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-slate-600 shadow-sm transition-all duration-200"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollNext}
              className="hover:text-brand-darkred hover:border-border-subtle flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-slate-600 shadow-sm transition-all duration-200"
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
