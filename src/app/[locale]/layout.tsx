import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import Script from "next/script";
import type { Metadata, Viewport } from "next";
import { constructMetadata, defaultViewport, buildOrganizationSchema, buildWebSiteSchema } from "@/shared/lib/seo";
import { serializeJsonLd } from "@/shared/lib/security";
import { FontPreloads } from "@/shared/components/layout/font-preloads";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { RootProviders } from "@/shared/providers/root-providers";
import { FireworksCelebrate } from "@/shared/components/FireworksCelebrate";
import { FloatingMessenger } from "@/shared/components/layout/FloatingMessenger";
import "../globals.css";

// Sinh static params cho locales
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = defaultViewport;

// Cấu hình Metadata API chuẩn cho SEO đa ngôn ngữ
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  const title = isEn
    ? "SET VinhUni - College of Engineering and Technology"
    : "Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh";
  const description = isEn
    ? "Welcome to the School of Engineering and Technology - Vinh University. A prestigious center for high-quality education and research in IT, Automation, and Engineering."
    : "Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh. Nơi đào tạo kỹ sư, cử nhân chất lượng cao các ngành Công nghệ thông tin, Điện tử, Tự động hóa, Ô tô và Công nghệ nhiệt.";

  return constructMetadata({
    title,
    description,
    locale,
  });
}

import { TopBar } from "@/shared/components/layout/top-bar";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { menuService } from "@/features/menu/services/menuService";
import { languageService } from "@/features/language/services/languageService";
import { articleService } from "@/features/article/services/articleService";
import { PushNotificationManager } from "@/features/notification/components/PushNotificationManager";
import { MaintenanceHandler } from "@/shared/components/layout/MaintenanceHandler";

// Helper chuyển tiếng Việt có dấu thành không dấu, thay khoảng trắng bằng gạch ngang
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .trim()
    .replace(/\s+/g, "-") // replace spaces with -
    .replace(/-+/g, "-"); // remove duplicate -
}

function resolveMenuTreeSlugs(items: any[], articles: any[]) {
  for (const item of items) {
    if (item.target_type === "ARTICLE" || item.target_type === "PAGE") {
      if (!item.target_info?.slug) {
        const matchedArticle = articles.find((a) => a.id === item.target_id);
        if (matchedArticle) {
          item.target_info = {
            title: item.title || matchedArticle.title,
            slug: matchedArticle.slug
          };
          item.has_link = true;
        } else if (item.title) {
          item.target_info = {
            title: item.title,
            slug: toSlug(item.title)
          };
          item.has_link = true;
        }
      }
    }
    if (item.children && item.children.length > 0) {
      resolveMenuTreeSlugs(item.children, articles);
    }
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  noStore();
  const { locale } = await params;

  // Kiểm tra xem locale có hợp lệ không
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Cấu hình static rendering locale
  setRequestLocale(locale);

  // Load dictionary cho Client Components
  const messages = await getMessages();

  // Load menu, languages và articles từ Server song song để tối ưu Core Web Vitals
  let headerMenu = null;
  let footerMenu = null;
  let languages: any[] = [];
  let articles: any[] = [];
  let isMaintenance = false;

  try {
    const [headerRes, footerRes, langRes, articlesData] = await Promise.all([
      menuService.getMenuTree("header").catch(() => null),
      menuService.getMenuTree("footer").catch(() => null),
      languageService.getLanguages().catch(() => []),
      articleService.getLatestArticles({ page: 1, pageSize: 100 }).catch(() => null)
    ]);

    headerMenu = headerRes;
    footerMenu = footerRes;
    languages = langRes || [];
    articles = articlesData?.items || [];

    if (languages.length === 0 || !headerMenu) {
      isMaintenance = true;
    }
  } catch (err) {
    console.error("API connection failed in layout:", err);
    isMaintenance = true;
  }

  if (isMaintenance) {
    const isEn = locale === "en";
    return (
      <html
        lang={locale}
        className="h-full antialiased"
      >
        <head><FontPreloads /></head>
        <body className="h-full bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-6">
          <MaintenanceHandler />
          <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12 transition-all duration-300 hover:shadow-2xl">
            <div className="inline-flex items-center justify-center size-20 rounded-full bg-red-50 text-red-600 mb-6 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A1.75 1.75 0 0 1 14.75 23.5l-5.83-5.83M11.42 15.17l2.42-2.42M11.42 15.17 9 17.58M13.84 12.75 19.67 18.58A1.75 1.75 0 0 0 22.17 16.08l-5.83-5.83M13.84 12.75l-2.42 2.42M13.84 12.75 16.25 10.33M8.42 18.17l-5.83-5.83A1.75 1.75 0 0 1 5.09 9.83l5.83 5.83M8.42 18.17l2.42-2.42M8.42 18.17 6 20.58M10.84 15.75 16.67 21.58A1.75 1.75 0 0 0 19.17 19.08l-5.83-5.83M10.84 15.75l-2.42 2.42M10.84 15.75 13.25 13.33" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">
              {isEn ? "System Under Maintenance" : "Hệ thống đang bảo trì"}
            </h1>
            
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              {isEn
                ? "The College of Engineering and Technology - Vinh University is currently undergoing scheduled upgrades to serve you better. We will be back online shortly. Thank you for your patience!"
                : "Cổng thông tin Trường Kỹ thuật & Công nghệ - Trường Đại học Vinh đang được bảo trì nâng cấp hệ thống. Vui lòng quay lại sau. Xin chân thành cảm ơn!"}
            </p>

            <div className="text-xs text-slate-400 border-t border-slate-100 pt-4 flex justify-between items-center">
              <span>SET Vinh University</span>
              <a 
                href={isEn ? "/vi" : "/en"} 
                className="text-red-600 hover:text-red-700 font-semibold transition-colors"
              >
                {isEn ? "Tiếng Việt" : "English"}
              </a>
            </div>
          </div>
        </body>
      </html>
    );
  }

  if (headerMenu?.items) {
    resolveMenuTreeSlugs(headerMenu.items, articles);
  }
  if (footerMenu?.items) {
    resolveMenuTreeSlugs(footerMenu.items, articles);
  }

  // Centralized Organization & WebSite JSON-LD Schemas
  const orgSchema = buildOrganizationSchema(locale);
  const webSiteSchema = buildWebSiteSchema(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head suppressHydrationWarning>
        <FontPreloads />
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-YNL3YLDM52"
          strategy="lazyOnload"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-YNL3YLDM52');
            `,
          }}
        />
        {/* Injecting System-wide Schemas */}
        <script
          suppressHydrationWarning
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(orgSchema) }}
        />
        <script
          suppressHydrationWarning
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(webSiteSchema) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full bg-background text-foreground flex flex-col">

        <NextIntlClientProvider messages={messages}>
          <RootProviders>
            <Suspense fallback={null}>
              <FireworksCelebrate />
            </Suspense>
            <TopBar initialLanguages={languages} />
            <Header initialMenu={headerMenu} />
            <main className="flex-1 relative bg-gradient-to-b from-[#fcfdfd] via-[#f7faf8]/40 to-[#f6fbf8]/50 overflow-x-clip">
              {/* Page content layered in z-10 */}
              <div className="relative z-10 flow-root">{children}</div>
            </main>
            <Footer initialMenu={footerMenu} />

            {/* Quản lý đăng ký nhận Web Push Notification */}
            <PushNotificationManager />

            {/* Floating Messenger Button (Homepage Only) */}
            <FloatingMessenger />
          </RootProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
