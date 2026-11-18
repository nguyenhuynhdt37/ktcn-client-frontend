import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

type SupportedLocale = (typeof routing.locales)[number];

function isSupportedLocale(value?: string | null): value is SupportedLocale {
  return Boolean(value && (routing.locales as readonly string[]).includes(value));
}

// Tự động xác định locale và redirect từ trang chủ không locale về locale phù hợp
export default async function RootPage() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value || cookieStore.get("NEXT_LOCALE")?.value;

  // 1. Nếu có cookie hợp lệ do người dùng chọn trước đó, redirect sang locale đó
  if (isSupportedLocale(cookieLocale)) {
    redirect(`/${cookieLocale}`);
  }

  // 2. Nếu chưa có cookie hợp lệ, gọi API ngôn ngữ công khai tìm ngôn ngữ mặc định (is_default: true)
  const apiBaseUrl =
    process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/portal/languages`, {
      next: {
        revalidate: 3600, // Cache 1 giờ
      },
    });

    if (res.ok) {
      const languages = (await res.json()) as Array<{ code?: string; is_default?: boolean }>;
      const defaultLang = languages.find((lang) => lang.is_default);
      if (isSupportedLocale(defaultLang?.code)) {
        redirect(`/${defaultLang.code}`);
      }
    }
  } catch (error) {
    console.error("Failed to fetch default language from API, falling back to /vi", error);
  }

  // Fallback về locale mặc định
  redirect(`/${routing.defaultLocale}`);
}
