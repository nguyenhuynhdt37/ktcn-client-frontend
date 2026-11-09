// src/shared/components/FireworksCelebrate.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { GraduationCap } from "lucide-react";
import type { Fireworks } from "fireworks-js";
import { useLocale } from "next-intl";

// Helper đọc cookie ở client-side
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export function FireworksCelebrate() {
  const [show, setShow] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fireworksRef = useRef<Fireworks | null>(null);
  const locale = useLocale();
  const isEn = locale === "en";

  // Logic đồng bộ thông minh: nổ pháo cho khách mới (kể cả khi chưa kịp có cookie guest_uuid)
  // và tránh nổ lại khi họ tải lại trang hoặc có cookie mới.
  useEffect(() => {
    const guestUuid = getCookie("guest_uuid");
    const generalFired = localStorage.getItem("fireworks_fired_general");

    if (guestUuid) {
      const uuidFired = localStorage.getItem(`fireworks_fired_${guestUuid}`);
      if (!uuidFired && !generalFired) {
        setShow(true);
        localStorage.setItem(`fireworks_fired_${guestUuid}`, "true");
        localStorage.setItem("fireworks_fired_general", "true");
      } else if (generalFired && !uuidFired) {
        localStorage.setItem(`fireworks_fired_${guestUuid}`, "true");
      }
    } else {
      if (!generalFired) {
        setShow(true);
        localStorage.setItem("fireworks_fired_general", "true");
      }
    }
  }, []);

  // Quản lý thời gian hiển thị banner và pháo hoa độc lập
  useEffect(() => {
    if (show) {
      setShowBanner(true);

      const hideBannerTimeout = setTimeout(() => {
        setShowBanner(false);
      }, 4500); // 4.5s ẩn banner

      const removeTimeout = setTimeout(() => {
        setShow(false);
      }, 6000); // 6s tắt pháo hoa

      return () => {
        clearTimeout(hideBannerTimeout);
        clearTimeout(removeTimeout);
      };
    }
  }, [show]);

  useEffect(() => {
    if (!show || !containerRef.current) return;

    // Cấu hình pháo hoa nhẹ nhàng, thanh lịch và ít tốn CPU hơn
    const options = {
      autoresize: true,
      opacity: 0.85,
      acceleration: 1.05,
      friction: 0.98,
      gravity: 1.4,
      particles: 60, // Giảm số lượng hạt để nhẹ hơn
      traceLength: 3,
      traceSpeed: 15,
      explosion: 5.5, // Giảm kích thước nổ
      intensity: 18, // Giảm mật độ nổ liên tục
      flickering: 50,
      lineStyle: "round" as const,
      hue: {
        min: 0,
        max: 360,
      },
      delay: {
        min: 30,
        max: 60, // Khoảng cách nổ giãn rộng hơn
      },
      rocketsPoint: {
        min: 20,
        max: 80, // Gom vùng bắn pháo lại gọn hơn
      },
      playInterval: {
        min: 15,
        max: 25,
      },
      sound: {
        enabled: false, // Câm lặng tránh lỗi Autoplay
      },
    };

    const container = containerRef.current;
    let cancelled = false;
    let fireworks: Fireworks | null = null;

    // Thư viện chỉ tải khi pháo hoa thực sự bật, không nằm trong JS của mọi trang.
    void import("fireworks-js").then(({ Fireworks: FireworksCtor }) => {
      if (cancelled) return;
      fireworks = new FireworksCtor(container, options);
      fireworksRef.current = fireworks;
      fireworks.start();
    });

    return () => {
      cancelled = true;
      fireworks?.stop();
    };
  }, [show]);

  if (!show) return null;

  const eventLabel = isEn ? "SPECIAL EVENT" : "SỰ KIỆN ĐẶC BIỆT";
  const celebrateText = isEn ? (
    <>
      Welcome to the establishment of the{" "}
      <span className="text-brand-darkred font-black">
        College of Engineering & Technology
      </span>{" "}
      — New journey, new future!
    </>
  ) : (
    <>
      Chào mừng thành lập{" "}
      <span className="text-brand-darkred font-black">
        Trường Kỹ thuật & Công nghệ
      </span>{" "}
      — Chặng đường mới, tương lai mới!
    </>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none bg-transparent">
      {/* Celebratory Banner (z-10) matching the project's light, clean header theme */}
      <div
        className={`absolute top-0 left-0 w-full z-10 px-6 py-4 bg-white/95 border-b border-slate-200/80 backdrop-blur-md shadow-lg flex justify-between items-center transition-[transform,opacity] duration-700 ease-in-out pointer-events-auto ${
          showBanner ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Left Peach Blossom & Rose 3D Branch Ornament */}
        <svg className="absolute left-0 top-0 h-full w-40 pointer-events-none hidden md:block" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="rose3d-left-1" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="70%" stopColor="#E60000" />
              <stop offset="100%" stopColor="#7A0000" />
            </radialGradient>
            <radialGradient id="rose3d-left-2" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFA1A1" />
              <stop offset="80%" stopColor="#D60000" />
              <stop offset="100%" stopColor="#5A0000" />
            </radialGradient>
            <radialGradient id="peach3d-left" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF2F2" />
              <stop offset="50%" stopColor="#FF85A2" />
              <stop offset="100%" stopColor="#E6005C" />
            </radialGradient>
            <linearGradient id="leaf3d-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A3E635" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>
            <filter id="shadow3d-left" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1.5" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Main brown wood branch */}
          <path d="M 0,30 Q 30,22 65,36 Q 80,42 95,30" stroke="#4A2F25" strokeWidth="3" strokeLinecap="round" filter="url(#shadow3d-left)" />
          <path d="M 22,27 Q 35,12 45,9" stroke="#4A2F25" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 45,32 Q 55,48 70,50" stroke="#4A2F25" strokeWidth="1.8" strokeLinecap="round" />

          {/* Green Leaves */}
          <path d="M 25,12 Q 18,5 25,2 Q 32,5 25,12 Z" fill="url(#leaf3d-left)" filter="url(#shadow3d-left)" />
          <path d="M 52,43 Q 57,48 52,54 Q 47,48 52,43 Z" fill="url(#leaf3d-left)" filter="url(#shadow3d-left)" />
          <path d="M 76,28 Q 84,24 81,18 Q 73,22 76,28 Z" fill="url(#leaf3d-left)" filter="url(#shadow3d-left)" />

          {/* Peach Blossom 1 */}
          <g filter="url(#shadow3d-left)">
            <ellipse cx="38" cy="20" rx="4.5" ry="5.5" fill="url(#peach3d-left)" transform="rotate(-30, 38, 20)" />
            <ellipse cx="44" cy="22" rx="4.5" ry="5.5" fill="url(#peach3d-left)" transform="rotate(42, 44, 22)" />
            <ellipse cx="41" cy="28" rx="4.5" ry="5.5" fill="url(#peach3d-left)" transform="rotate(114, 41, 28)" />
            <ellipse cx="33" cy="29" rx="4.5" ry="5.5" fill="url(#peach3d-left)" transform="rotate(186, 33, 29)" />
            <ellipse cx="31" cy="23" rx="4.5" ry="5.5" fill="url(#peach3d-left)" transform="rotate(258, 31, 23)" />
            <circle cx="37.4" cy="24.4" r="2" fill="#FCD34D" />
          </g>

          {/* Peach Blossom 2 */}
          <g filter="url(#shadow3d-left)" transform="translate(28, 12) scale(0.85)">
            <ellipse cx="38" cy="20" rx="4.5" ry="5.5" fill="url(#peach3d-left)" transform="rotate(-15, 38, 20)" />
            <ellipse cx="44" cy="22" rx="4.5" ry="5.5" fill="url(#peach3d-left)" transform="rotate(57, 44, 22)" />
            <ellipse cx="41" cy="28" rx="4.5" ry="5.5" fill="url(#peach3d-left)" transform="rotate(129, 41, 28)" />
            <ellipse cx="33" cy="29" rx="4.5" ry="5.5" fill="url(#peach3d-left)" transform="rotate(201, 33, 29)" />
            <ellipse cx="31" cy="23" rx="4.5" ry="5.5" fill="url(#peach3d-left)" transform="rotate(273, 31, 23)" />
            <circle cx="37.4" cy="24.4" r="2" fill="#FCD34D" />
          </g>

          {/* 3D Rose */}
          <g filter="url(#shadow3d-left)" transform="translate(8, 12)">
            <circle cx="12" cy="12" r="9.5" fill="url(#rose3d-left-2)" />
            <path d="M 5,9 C 6,4 12,3 15,6 C 18,9 19,15 15,18 C 11,21 5,18 5,9 Z" fill="url(#rose3d-left-1)" opacity="0.9" />
            <circle cx="12" cy="12" r="6" fill="url(#rose3d-left-2)" />
            <path d="M 8,10 C 9,7 13,7 14,9 C 15,11 15,13 13,14 C 11,15 9,15 8,13 C 7,12 7,11 8,10 Z" fill="url(#rose3d-left-1)" />
            <circle cx="12" cy="12" r="3.2" fill="#B91C1C" />
          </g>
        </svg>

        {/* Right Peach Blossom & Rose 3D Branch Ornament (Mirrored) */}
        <svg className="absolute right-0 top-0 h-full w-40 pointer-events-none hidden md:block" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" transform="scale(-1, 1)">
          <defs>
            <radialGradient id="rose3d-right-1" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="70%" stopColor="#E60000" />
              <stop offset="100%" stopColor="#7A0000" />
            </radialGradient>
            <radialGradient id="rose3d-right-2" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFA1A1" />
              <stop offset="80%" stopColor="#D60000" />
              <stop offset="100%" stopColor="#5A0000" />
            </radialGradient>
            <radialGradient id="peach3d-right" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF2F2" />
              <stop offset="50%" stopColor="#FF85A2" />
              <stop offset="100%" stopColor="#E6005C" />
            </radialGradient>
            <linearGradient id="leaf3d-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A3E635" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>
            <filter id="shadow3d-right" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1.5" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Main brown wood branch */}
          <path d="M 0,30 Q 30,22 65,36 Q 80,42 95,30" stroke="#4A2F25" strokeWidth="3" strokeLinecap="round" filter="url(#shadow3d-right)" />
          <path d="M 22,27 Q 35,12 45,9" stroke="#4A2F25" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 45,32 Q 55,48 70,50" stroke="#4A2F25" strokeWidth="1.8" strokeLinecap="round" />

          {/* Green Leaves */}
          <path d="M 25,12 Q 18,5 25,2 Q 32,5 25,12 Z" fill="url(#leaf3d-right)" filter="url(#shadow3d-right)" />
          <path d="M 52,43 Q 57,48 52,54 Q 47,48 52,43 Z" fill="url(#leaf3d-right)" filter="url(#shadow3d-right)" />
          <path d="M 76,28 Q 84,24 81,18 Q 73,22 76,28 Z" fill="url(#leaf3d-right)" filter="url(#shadow3d-right)" />

          {/* Peach Blossom 1 */}
          <g filter="url(#shadow3d-right)">
            <ellipse cx="38" cy="20" rx="4.5" ry="5.5" fill="url(#peach3d-right)" transform="rotate(-30, 38, 20)" />
            <ellipse cx="44" cy="22" rx="4.5" ry="5.5" fill="url(#peach3d-right)" transform="rotate(42, 44, 22)" />
            <ellipse cx="41" cy="28" rx="4.5" ry="5.5" fill="url(#peach3d-right)" transform="rotate(114, 41, 28)" />
            <ellipse cx="33" cy="29" rx="4.5" ry="5.5" fill="url(#peach3d-right)" transform="rotate(186, 33, 29)" />
            <ellipse cx="31" cy="23" rx="4.5" ry="5.5" fill="url(#peach3d-right)" transform="rotate(258, 31, 23)" />
            <circle cx="37.4" cy="24.4" r="2" fill="#FCD34D" />
          </g>

          {/* Peach Blossom 2 */}
          <g filter="url(#shadow3d-right)" transform="translate(28, 12) scale(0.85)">
            <ellipse cx="38" cy="20" rx="4.5" ry="5.5" fill="url(#peach3d-right)" transform="rotate(-15, 38, 20)" />
            <ellipse cx="44" cy="22" rx="4.5" ry="5.5" fill="url(#peach3d-right)" transform="rotate(57, 44, 22)" />
            <ellipse cx="41" cy="28" rx="4.5" ry="5.5" fill="url(#peach3d-right)" transform="rotate(129, 41, 28)" />
            <ellipse cx="33" cy="29" rx="4.5" ry="5.5" fill="url(#peach3d-right)" transform="rotate(201, 33, 29)" />
            <ellipse cx="31" cy="23" rx="4.5" ry="5.5" fill="url(#peach3d-right)" transform="rotate(273, 31, 23)" />
            <circle cx="37.4" cy="24.4" r="2" fill="#FCD34D" />
          </g>

          {/* 3D Rose */}
          <g filter="url(#shadow3d-right)" transform="translate(8, 12)">
            <circle cx="12" cy="12" r="9.5" fill="url(#rose3d-right-2)" />
            <path d="M 5,9 C 6,4 12,3 15,6 C 18,9 19,15 15,18 C 11,21 5,18 5,9 Z" fill="url(#rose3d-right-1)" opacity="0.9" />
            <circle cx="12" cy="12" r="6" fill="url(#rose3d-right-2)" />
            <path d="M 8,10 C 9,7 13,7 14,9 C 15,11 15,13 13,14 C 11,15 9,15 8,13 C 7,12 7,11 8,10 Z" fill="url(#rose3d-right-1)" />
            <circle cx="12" cy="12" r="3.2" fill="#B91C1C" />
          </g>
        </svg>

        {/* Underline brand color */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-darkred" />

        <div className="max-w-7xl mx-auto w-full flex items-center justify-center gap-6 relative z-10 px-0 md:px-12">
          {/* Left: Brand Icon & Title */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-darkred/5 border border-brand-darkred/20 flex items-center justify-center text-brand-darkred shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-[9px] font-black tracking-[0.2em] text-brand-darkred block uppercase">
                {eventLabel}
              </span>
              <h1 className="text-xs md:text-sm font-bold text-slate-800 tracking-wide mt-0.5 leading-snug">
                {celebrateText}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Container for fireworks-js (z-20) - Layered on top of the banner */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full block bg-transparent z-20" />
    </div>
  );
}
