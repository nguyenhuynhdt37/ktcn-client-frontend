"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { ChevronDown, Check } from "lucide-react";
import Image from "next/image";
import { languageService } from "../services/languageService";
import { Language } from "../types/language.types";

interface LanguageSwitcherProps {
  initialLanguages?: Language[];
}

export function LanguageSwitcher({ initialLanguages }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const [apiLanguages, setApiLanguages] = useState<Language[]>(initialLanguages || []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch danh sách ngôn ngữ động từ API nếu chưa có dữ liệu từ Server-side (SSR fallback)
  useEffect(() => {
    if (initialLanguages && initialLanguages.length > 0) {
      setApiLanguages(initialLanguages);
      return;
    }

    let isMounted = true;
    languageService.getLanguages().then((langs) => {
      if (isMounted && langs && langs.length > 0) {
        setApiLanguages(langs);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [initialLanguages]);

  // Danh sách các locale FE Client đang thực sự hỗ trợ dịch
  const supportedLocales = ["vi", "en"];

  // Dữ liệu fallback tĩnh
  const staticLanguages: Language[] = [
    {
      id: "vi",
      code: "vi",
      name: "Vietnamese",
      native_name: "Tiếng Việt",
      flag_id: null,
      flag_url: null,
      is_default: true,
    },
    {
      id: "en",
      code: "en",
      name: "English",
      native_name: "English",
      flag_id: null,
      flag_url: null,
      is_default: false,
    },
  ];

  // Lọc lấy các ngôn ngữ từ API được FE hỗ trợ, nếu API trống thì dùng static
  const languages =
    apiLanguages.length > 0
      ? apiLanguages.filter((lang) => supportedLocales.includes(lang.code))
      : staticLanguages;

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  const handleLanguageChange = (nextLocale: string) => {
    if (nextLocale === locale) {
      setIsOpen(false);
      return;
    }

    // 1. Cập nhật Cookie (để SSR đọc được) và localStorage
    document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    localStorage.setItem("lang", nextLocale);

    const query = Object.fromEntries(searchParams.entries());

    // 2. Xử lý chuyển hướng thông minh cho trang chi tiết động (slug) để tránh 404
    if (params && params.slug) {
      const pathnameStr = pathname as string;
      const isCalendarPage =
        pathnameStr.includes("/lich-tuan") || pathnameStr.includes("/weekly-calendar");

      startTransition(() => {
        if (isCalendarPage) {
          router.push({ pathname: "/lich-tuan" }, { locale: nextLocale, scroll: false });
        } else {
          router.push({ pathname: "/tin-tuc" }, { locale: nextLocale, scroll: false });
        }
      });
      setIsOpen(false);
      return;
    }

    // 3. Xử lý trang tìm kiếm/tin tức: loại bỏ các filter slug tiếng Việt không tương thích
    if (pathname === "/tin-tuc") {
      const cleanQuery: Record<string, string> = {};
      if (query.q) {
        cleanQuery.q = query.q;
      }
      startTransition(() => {
        router.push(
          {
            pathname: "/tin-tuc",
            query: cleanQuery,
          },
          { locale: nextLocale, scroll: false },
        );
      });
      setIsOpen(false);
      return;
    }

    // 4. Các trang tĩnh thông thường khác
    startTransition(() => {
      // scroll: false để giữ vị trí cuộn trang hiện tại của người dùng
      router.push(
        {
          pathname: pathname as any,
          params: params as any,
          query: query,
        },
        { locale: nextLocale, scroll: false },
      );
    });
    setIsOpen(false);
  };

  const renderFlag = (lang: Language) => {
    if (lang.flag_url) {
      return (
        <div className="relative h-3.5 w-5 flex-shrink-0 overflow-hidden border border-white/10">
          <Image
            src={lang.flag_url}
            alt={lang.native_name || lang.name}
            fill
            unoptimized
            sizes="20px"
            className="object-cover"
          />
        </div>
      );
    }

    // Flag placeholder emoji
    const emojis: Record<string, string> = {
      vi: "🇻🇳",
      en: "🇬🇧",
    };
    return <span className="flex-shrink-0 text-sm">{emojis[lang.code] || "🏳️"}</span>;
  };

  return (
    <div suppressHydrationWarning className="relative inline-block text-left" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        type="button"
        className="hover:text-brand-yellow flex min-h-9 cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 text-sm font-medium text-slate-100 transition-colors duration-150 hover:bg-white/10"
      >
        {renderFlag(currentLanguage)}
        <span>{currentLanguage.native_name}</span>
        <ChevronDown
          size={10}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-1 absolute right-0 z-50 mt-1.5 w-36 rounded-none border border-slate-200 bg-white py-1 shadow-lg duration-150">
          {languages.map((lang) => {
            const isSelected = lang.code === locale;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                type="button"
                className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-xs font-semibold transition ${
                  isSelected
                    ? "bg-brand-darkred/5 text-brand-darkred"
                    : "hover:text-brand-darkred text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {renderFlag(lang)}
                  <span>{lang.native_name}</span>
                </div>
                {isSelected && <Check size={12} className="text-brand-darkred" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
