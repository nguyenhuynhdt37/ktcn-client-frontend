"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { Sparkles, Trophy } from "lucide-react";
import { StudentLifeCarousel } from "./StudentLifeCarousel";
import { ImageLightboxModal } from "./ImageLightboxModal";

export function AboutStudentLife() {
  const t = useTranslations("about");
  const locale = useLocale();
  const isEn = locale === "en";

  const clubs = [
    {
      name: isEn ? "VinhUni Computer Rescue Team (CHMT)" : "Đội Cứu hộ Máy tính VinhUni (CHMT)",
      desc: isEn 
        ? "Assisting students and staff with hardware repair, software setup, OS installation, system cleanup, virus removal, and tech support."
        : "Đội ngũ kỹ thuật hỗ trợ cài đặt phần cứng/phần mềm, tối ưu hệ điều hành, diệt virus, cứu hộ hệ thống và chia sẻ kiến thức công nghệ cho sinh viên.",
      image: "/images/about/chmt_logo.png",
      link: "https://www.facebook.com/chmtvinhuni.edu",
    },
    {
      name: isEn ? "ITUP Digital Literacy & Software Club" : "CLB Tin học & Phổ cập số ITUP (Bình dân học vụ số)",
      desc: isEn
        ? "Promoting digital literacy, office software skills, online public services, and cybersecurity awareness while developing AI & software projects."
        : "Tiên phong phổ cập kỹ năng số, tin học văn phòng, hướng dẫn dịch vụ công trực tuyến cho cộng đồng, kết hợp nghiên cứu phát triển phần mềm và AI.",
      image: "/images/about/itup_logo.png",
      link: "https://www.facebook.com/itup.binhdanhocvuso.dhv",
    },
  ];

  const galleryImages = [
    { src: "/images/about/activity_chmt_1.jpg", title: isEn ? "CHMT technical support desk" : "Sinh viên Đội CHMT hỗ trợ kỹ thuật máy tính trực tiếp cho cán bộ, giảng viên" },
    { src: "/images/about/activity_chmt_2.png", title: isEn ? "CHMT members receiving activity gifts" : "Đoàn viên Đội CHMT nhận các phần quà và trang thiết bị cứu hộ kỹ thuật" },
    { src: "/images/about/activity_chmt_3.jpg", title: isEn ? "VinhUni Computer Rescue Team ceremony" : "Lễ ra mắt và các hoạt động tình nguyện của Đội Cứu hộ Máy tính VinhUni" },
    { src: "/images/about/activity_chmt_4.jpg", title: isEn ? "CHMT collaboration with Huy Khanh Computer" : "Thành viên Đội CHMT làm việc thực tế tại trung tâm đối tác kỹ thuật" },
    { src: "/images/about/activity_itup_1.jpg", title: isEn ? "ITUP club academic award gifts" : "Đại diện CLB IT.UP tặng quà động viên và chúc mừng thành tích học tập xuất sắc" },
    { src: "/images/about/activity_itup_2.jpg", title: isEn ? "ITUP monthly birthday party and activity" : "Buổi sinh hoạt tập thể kết hợp chúc mừng sinh nhật thành viên CLB IT.UP" },
    { src: "/images/about/activity_welcome.jpg", title: isEn ? "Welcoming freshmen at Viện KTCN desk" : "Sinh viên tình nguyện nhiệt tình hướng dẫn tân sinh viên làm thủ tục nhập học Viện KTCN" },
    { src: "/images/about/activity_team.jpg", title: isEn ? "VinhUni SET student delegates at congress" : "Tập thể đoàn đại biểu sinh viên Viện Kỹ thuật và Công nghệ tại Đại hội" },
    { src: "/images/about/activity_team_2.jpg", title: isEn ? "Scholarship and support gifts for SET students" : "Nhà trường và Viện KTCN trao quà hỗ trợ học tập cho các sinh viên vượt khó" },
    { src: "/images/about/activity_predator.jpg", title: isEn ? "VinhUni SET students at Predator Fest event" : "Giảng viên và sinh viên Viện KTCN tham gia trải nghiệm công nghệ tại sự kiện Predator Fest" },
  ];

  // Lightbox Modal States
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setActiveImageIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <section className="py-14 md:py-20 bg-slate-50/50 space-y-16">
      
      {/* 1. Top Section - Contained inside standard max-width */}
      <div className="max-w-[1360px] mx-auto px-6 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-brand-darkred bg-brand-darkred/6 rounded-full">
            {t("student_life_heading")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {t("student_life_heading")}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            {t("student_life_subtext")}
          </p>
        </div>

        {/* Clubs Section - Horizontal Grid Layout */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles size={18} className="text-brand-darkred" />
            <span>{t("student_life_clubs")}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clubs.map((club, idx) => (
              <a 
                key={idx}
                href={club.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-5 p-6 bg-white border border-slate-200/80 rounded-xl hover:border-brand-darkred/20 hover:shadow-sm transition-all duration-300 ease-out cursor-pointer block group"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200/80 flex items-center justify-center shrink-0 shadow-xs relative">
                  <Image 
                    src={club.image} 
                    alt={club.name} 
                    fill
                    sizes="56px"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                  />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-darkred transition-colors flex items-center gap-1.5 truncate">
                    {club.name}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {club.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Gallery Title (Aligned inside container) */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Trophy size={18} className="text-brand-darkred" />
            <span>{t("student_life_gallery")}</span>
          </h3>
        </div>

      </div>

      {/* 2. Horizontal Marquee Slider - Full Width (Out of max-width container) */}
      <div className="w-full">
        <StudentLifeCarousel
          images={galleryImages}
          onImageClick={handleImageClick}
        />
      </div>

      {/* 3. Lightbox Modal */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={galleryImages}
        activeIndex={activeImageIndex}
        onActiveIndexChange={setActiveImageIndex}
      />

    </section>
  );
}
