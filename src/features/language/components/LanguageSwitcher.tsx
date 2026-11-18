"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { ChevronDown, Check } from "lucide-react";
import Image from "next/image";
import { languageSwitchTarget } from "@/features/cet/utils/links";
import { safePortalHref } from "@/shared/lib/security";
import { languageService } from "../services/languageService";
import { Language } from "../types/language.types";

interface LanguageSwitcherProps {
  initialLanguages?: Language[];
}

function persistLocalePreference(nextLocale: string) {
  if (typeof document !== "undefined") {
    document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
  }
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem("lang", nextLocale);
    } catch {
      // ignore storage errors in restricted contexts
    }
  }
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
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [fetchedLanguages, setFetchedLanguages] = useState<Language[]>([]);
  const hasInitialLanguages = Boolean(initialLanguages && initialLanguages.length > 0);
  const apiLanguages = hasInitialLanguages ? initialLanguages! : fetchedLanguages;

  // Đóng dropdown khi click ra ngoài hoặc nhấn Escape
  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Fetch danh sách ngôn ngữ động từ API nếu chưa có dữ liệu từ Server-side (SSR fallback)
  useEffect(() => {
    if (hasInitialLanguages) return;

    let isMounted = true;
    languageService.getLanguages().then((langs) => {
      if (isMounted && langs && langs.length > 0) {
        setFetchedLanguages(langs);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [hasInitialLanguages]);

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
    persistLocalePreference(nextLocale);

    const query = Object.fromEntries(searchParams.entries());
    const target = languageSwitchTarget(pathname, query, Boolean(params?.slug));

    startTransition(() => {
      router.push(target as Parameters<typeof router.push>[0], {
        locale: nextLocale,
        scroll: false,
      });
    });
    setIsOpen(false);
  };

  return (
    <div
      suppressHydrationWarning
      className="relative inline-block text-left"
      ref={containerRef}
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget as Node)) {
          setIsOpen(false);
        }
      }}
    >
      <LanguageSwitcherTrigger
        ref={triggerRef}
        language={currentLanguage}
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isPending}
        isOpen={isOpen}
      />

      {isOpen && (
        <div
          role="listbox"
          aria-label={locale === "en" ? "Select language" : "Chọn ngôn ngữ"}
          className="animate-in fade-in slide-in-from-top-1 absolute right-0 z-50 mt-1.5 w-36 rounded-md border border-slate-200 bg-white py-1 shadow-lg duration-150"
        >
          {languages.map((lang) => {
            const isSelected = lang.code === locale;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isSelected}
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
                {isSelected && <Check size={12} className="text-brand-darkred" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function renderFlag(lang: Language) {
  const safeFlagUrl = lang.flag_url ? safePortalHref(lang.flag_url, "") : "";
  if (safeFlagUrl && safeFlagUrl !== "#") {
    return (
      <div className="relative h-3.5 w-5 flex-shrink-0 overflow-hidden border border-white/10">
        <Image
          src={safeFlagUrl}
          alt={lang.native_name || lang.name}
          fill
          unoptimized
          sizes="20px"
          className="object-cover"
        />
      </div>
    );
  }

  const emojis: Record<string, string> = {
    vi: "🇻🇳",
    en: "🇬🇧",
  };
  return <span className="flex-shrink-0 text-sm">{emojis[lang.code] || "🏳️"}</span>;
}

import { forwardRef } from "react";

const LanguageSwitcherTrigger = forwardRef<
  HTMLButtonElement,
  {
    language: Language;
    onClick?: () => void;
    disabled?: boolean;
    isOpen?: boolean;
  }
>(function LanguageSwitcherTrigger({ language, onClick, disabled, isOpen = false }, ref) {
  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      type="button"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      className="hover:text-brand-yellow flex min-h-9 cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 text-sm font-medium text-slate-100 transition-colors duration-150 hover:bg-white/10"
    >
      {renderFlag(language)}
      <span>{language.native_name}</span>
      <ChevronDown
        size={10}
        aria-hidden="true"
        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
  );
});

export function LanguageSwitcherPlaceholder({
  locale,
  initialLanguages,
}: LanguageSwitcherProps & { locale: string }) {
  const language = initialLanguages?.find((item) => item.code === locale) ?? {
    id: locale,
    code: locale,
    name: locale === "en" ? "English" : "Vietnamese",
    native_name: locale === "en" ? "English" : "Tiếng Việt",
    flag_id: null,
    flag_url: null,
    is_default: locale === "vi",
  };
  return (
    <div className="relative inline-block text-left animate-pulse">
      <LanguageSwitcherTrigger language={language} disabled />
    </div>
  );
}
