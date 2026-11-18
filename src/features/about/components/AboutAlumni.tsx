"use client";

import { usePathname } from "next/navigation";
import { Quote, Sparkles } from "lucide-react";
import Image from "next/image";

interface AlumniItem {
  id: string;
  name: string;
  class: string;
  roleVi: string;
  roleEn: string;
  company: string;
  avatarUrl: string;
  quoteVi: string;
  quoteEn: string;
}

export function AboutAlumni() {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");

  const content = {
    badge: isEn ? "Alumni Success" : "Cựu sinh viên tiêu biểu",
    heading: isEn ? "Graduate Success Stories" : "Gương mặt Cựu sinh viên tiêu biểu",
    subtext: isEn 
      ? "Outstanding alumni sharing their learning journeys and career success at leading technology corporations."
      : "Cùng lắng nghe chia sẻ của các cựu sinh viên tiêu biểu về hành trình học tập tại Viện và cơ hội bứt phá sự nghiệp tại các tập đoàn công nghệ lớn.",
  };

  const alumniList: AlumniItem[] = [
    {
      id: "alumni_1",
      name: "Nguyễn Văn Minh",
      class: "Khóa 59 CNTT",
      roleVi: "Kỹ sư AI & Xe tự hành",
      roleEn: "AI & Autonomous Systems Engineer",
      company: "VinFast Global",
      avatarUrl: "/images/about/set-activity-4.jpg", // Lễ bảo vệ đồ án tốt nghiệp ngành ô tô/điện
      quoteVi: "Chương trình đào tạo thực tiễn tại Viện KTCN đã giúp tôi nhanh chóng làm quen với các dự án xe điện thông minh toàn cầu tại VinFast ngay sau khi tốt nghiệp. Những buổi học chuyên ngành đều gắn liền với các công nghệ lõi hiện đại.",
      quoteEn: "The practical curriculum at the Institute helped me quickly adapt to global smart EV projects at VinFast immediately after graduation. Specialized courses were closely aligned with core modern technologies.",
    },
    {
      id: "alumni_2",
      name: "Trần Thị Thu Trang",
      class: "Khóa 60 KTPM",
      roleVi: "Software Architect",
      roleEn: "Software Architect",
      company: "FPT Software",
      avatarUrl: "/images/about/set-banner-1.png", // Ảnh hoạt động thực tế lớp CNTT
      quoteVi: "Cơ hội tham gia phát triển dự án thực tế cùng các giảng viên và doanh nghiệp đối tác từ năm thứ 3 là bước đệm tuyệt vời để tôi rèn luyện tư duy thiết kế hệ thống lớn và tự tin bước ra thị trường lao động toàn cầu.",
      quoteEn: "Opportunities to join real projects with professors and partner companies from my 3rd year were perfect stepping stones to build system design thinking and step into the global job market.",
    },
    {
      id: "alumni_3",
      name: "Lê Huy Hoàng",
      class: "Khóa 58 TĐH",
      roleVi: "Chuyên gia Tự động hóa",
      roleEn: "Automation Specialist",
      company: "Samsung Electronics",
      avatarUrl: "/images/about/set-activity-3.jpg", // Ảnh sinh viên tham gia cuộc thi sản phẩm sáng tạo
      quoteVi: "Phòng thí nghiệm hiện đại cùng các bài thực hành thiết kế vi điều khiển và lập trình PLC thực tế tại Viện đã trang bị cho tôi những kỹ năng chuyên môn vững chắc nhất, đáp ứng hoàn hảo tiêu chuẩn khắt khe từ đối tác Hàn Quốc.",
      quoteEn: "The modern Lab systems and practical microcontroller design/PLC programming at the Institute equipped me with the most solid professional skills, fully meeting the strict standards of Korean partners.",
    },
  ];

  return (
    <section className="py-14 md:py-20 bg-slate-50/40 border-t border-slate-100/60">
      <div className="max-w-[1360px] mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-brand-darkred bg-brand-darkred/5 border border-brand-darkred/10 rounded-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{content.badge}</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {content.heading}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {content.subtext}
          </p>
        </div>

        {/* Lưới cựu sinh viên: Ảnh tròn lớn, tên tác giả ở trên, câu nói ở dưới */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
          {alumniList.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between p-6 border border-border rounded-xl bg-white hover:border-border-subtle hover:shadow-sm transition-all duration-300 relative group"
            >
              <div className="space-y-5">
                {/* Phần trên: Ảnh hình tròn lớn và Thông tin Tác giả */}
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0 rounded-full shadow-sm ring-1 ring-brand-darkred/10">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-50">
                      <Image
                        src={item.avatarUrl}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Tên và Khóa học ở trên */}
                  <div className="space-y-0.5">
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-800">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {item.class}
                    </p>
                    {/* Tag Nơi công tác */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold text-slate-600 bg-slate-100 rounded-sm">
                        {isEn ? item.roleEn : item.roleVi}
                      </span>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold text-brand-darkred bg-brand-darkred/5 border border-brand-darkred/10 rounded-sm">
                        {item.company}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Đường kẻ ngang ngăn cách thanh lịch */}
                <div className="border-t border-slate-100" />

                {/* Phần dưới: Câu nói/Trích dẫn */}
                <div className="relative pl-3 border-l-2 border-brand-darkred/30">
                  {/* Icon Quote góc */}
                  <div className="absolute -top-1 right-0 text-slate-100 group-hover:text-brand-darkred/10 transition-colors -z-0">
                    <Quote className="w-6 h-6 rotate-180" />
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed italic relative z-10">
                    &ldquo;{isEn ? item.quoteEn : item.quoteVi}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
