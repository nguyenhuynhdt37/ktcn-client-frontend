"use client";

import { useEffect, useState, useRef } from "react";
import { GraduationCap, School, Rocket } from "lucide-react";

interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const CAMPUS_TIMELINE: TimelineEvent[] = [
  {
    id: "1",
    year: "2002",
    title: "Đặt nền móng đào tạo Kỹ thuật & Công nghệ",
    description: "Trường Đại học Vinh chính thức mở và tuyển sinh khóa đầu tiên các ngành Công nghệ Thông tin và Kỹ thuật Điện tử - Viễn thông, đặt nền móng lịch sử cho khối ngành công nghệ mũi nhọn.",
    icon: <GraduationCap className="w-4 h-4" />,
  },
  {
    id: "2",
    year: "2017",
    title: "Thành lập Viện Kỹ thuật và Công nghệ",
    description: "Tháng 4/2017, Viện Kỹ thuật và Công nghệ được thành lập trên cơ sở sáp nhập các ngành đào tạo kỹ thuật (Điện - Điện tử, Tự động hóa, Công nghệ Kỹ thuật Nhiệt) từ Khoa Vật lý - Công nghệ cũ để bứt phá mạnh mẽ.",
    icon: <School className="w-4 h-4" />,
  },
  {
    id: "3",
    year: "2026",
    title: "Nâng cấp thành Trường Kỹ thuật và Công nghệ",
    description: "Chính thức công bố quyết định thành lập Trường Kỹ thuật và Công nghệ trực thuộc Trường Đại học Vinh. Bước ngoặt lịch sử mở ra kỷ nguyên mới về quy mô, chất lượng đào tạo và nghiên cứu khoa học đáp ứng nhu cầu nhân lực chất lượng cao.",
    icon: <Rocket className="w-4 h-4" />,
  }
];

export function InteractiveTimeline() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const totalHeight = rect.height;
      const scrolled = windowHeight / 2 - rect.top; // Lấy điểm giữa màn hình làm điểm kích hoạt
      
      let progress = (scrolled / totalHeight) * 100;
      progress = Math.max(0, Math.min(100, progress));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="py-16 bg-slate-50 text-slate-800 border-t border-b border-slate-100" ref={containerRef}>
      <div className="max-w-5xl mx-auto px-6 relative">
        
        {/* Tiêu đề */}
        <div className="text-center mb-16 space-y-2">
          <span className="text-brand-darkred font-bold text-xs tracking-wider uppercase bg-brand-darkred/5 px-3 py-1 rounded-sm border border-brand-darkred/10">
            Hành Trình Phát Triển
          </span>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Chặng Đường Lịch Sử
          </h2>
          <p className="text-slate-600 max-w-md mx-auto text-sm font-normal leading-relaxed">
            Nhìn lại những cột mốc vàng đánh dấu sự phát triển vượt bậc của Trường Kỹ thuật và Công nghệ.
          </p>
        </div>

        {/* Khung chứa các phần tử Timeline */}
        <div className="relative w-full">
          
          {/* Trục dọc 1: Đường nền xám mờ phía sau */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-slate-200 -translate-x-1/2 rounded-full"></div>

          {/* Trục dọc 2: Đường chỉ màu đỏ chạy dọc theo cuộn trang */}
          <div 
            className="absolute left-4 md:left-1/2 top-0 w-[2px] bg-brand-darkred -translate-x-1/2 rounded-full origin-top"
            style={{ height: `${scrollProgress}%` }}
          ></div>

          {CAMPUS_TIMELINE.map((event, index) => (
            <TimelineItem 
              key={event.id} 
              event={event} 
              index={index} 
              isEven={index % 2 === 0} 
            />
          ))}

        </div>
      </div>
    </section>
  );
}

function TimelineItem({ event, index, isEven }: { event: TimelineEvent; index: number; isEven: boolean }) {
  const [active, setActive] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
        } else {
          setActive(false);
        }
      },
      {
        threshold: 0.25,
        rootMargin: "0px 0px -100px 0px"
      }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={itemRef} 
      className="relative mb-16 last:mb-0 md:grid md:grid-cols-9 md:items-center w-full"
    >
      {/* Mốc tròn phẳng trên thanh dọc */}
      <div 
        className={`
          absolute left-4 md:left-1/2 top-6 md:top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 
          flex items-center justify-center w-8 h-8 rounded-full border transition-colors duration-300
          ${active 
            ? "bg-brand-darkred border-brand-darkred text-white" 
            : "bg-white border-slate-100 text-slate-400"
          }
        `}
      >
        <div className="transition-opacity duration-300">
          {event.icon}
        </div>
      </div>

      {/* Hộp nội dung phẳng hiển thị nhẹ nhàng */}
      <div 
        className={`
          pl-10 md:pl-0 md:col-span-4 transition-opacity duration-500
          ${active ? "opacity-100" : "opacity-40"}
          ${isEven ? "md:text-right md:pr-10" : "md:col-start-6 md:pl-10"}
        `}
      >
        <div className="bg-white p-6 rounded-sm border border-slate-100/60  hover:border-brand-darkred transition-colors duration-150">
          
          {/* Số năm hiển thị to phẳng */}
          <span className={`
            text-3xl font-extrabold tracking-tight mb-1 block transition-colors duration-300
            ${active ? "text-brand-darkred" : "text-slate-400"}
          `}>
            {event.year}
          </span>
          
          <h4 className="text-base font-bold text-slate-800 mb-2 tracking-tight">{event.title}</h4>
          
          <p className="text-slate-600 text-sm leading-relaxed font-normal">{event.description}</p>
        </div>
      </div>

      {/* Cột trống đối xứng để giữ định dạng so le */}
      <div className="hidden md:block md:col-span-4"></div>
    </div>
  );
}
