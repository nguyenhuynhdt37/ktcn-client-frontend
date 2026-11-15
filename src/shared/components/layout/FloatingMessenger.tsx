"use client";

import { usePathname } from "next/navigation";

export function FloatingMessenger() {
  const pathname = usePathname();
  
  // Chỉ hiển thị ở trang chủ (chấp nhận "/", "/vi", "/en" và các biến thể có/không có dấu gạch chéo cuối)
  const isHomepage = ["/", "/vi", "/en", "/vi/", "/en/"].includes(pathname);

  if (!isHomepage) return null;

  return (
    <a
      href="https://www.facebook.com/Vienktcn"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#006AFF] to-[#00C6FF] text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl hover:brightness-105"
      aria-label="Messenger"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-white" aria-hidden="true">
        <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.9 1.25 5.51 3.25 7.35V22l2.84-1.56c1.23.34 2.53.53 3.91.53 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm1.47 11.75l-2.54-2.71-4.95 2.71 5.45-5.8 2.62 2.71 4.88-2.71-6.46 6.8z" />
      </svg>
    </a>
  );
}
