import { getPathname, Link } from "@/i18n/routing";
import { serializeJsonLd } from "@/shared/lib/security";
import { ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: "white" | "transparent";
}

export function Breadcrumb({ items, variant = "white" }: BreadcrumbProps) {
  const locale = useLocale();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://set.vinhuni.edu.vn";

  function getItemUrl(href?: string) {
    if (!href) return `${siteUrl}/${locale}`;
    if (/^https?:\/\//.test(href)) return href;
    const path = getPathname({
      locale: locale === "en" ? "en" : "vi",
      href: href as Parameters<typeof getPathname>[0]["href"],
    });
    return new URL(path, siteUrl).href;
  }

  // Xây dựng Schema.org BreadcrumbList JSON-LD
  const breadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getItemUrl(item.href),
    })),
  };

  const isTransparent = variant === "transparent";

  return (
    <>
      {/* Nhúng structured data cho Google Bot */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbListSchema) }}
      />

      {/* Breadcrumb UI */}
      <nav
        aria-label="Breadcrumb"
        suppressHydrationWarning
        className={
          isTransparent
            ? "flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-300 font-medium"
            : "border-border flex min-h-12 flex-wrap items-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm text-slate-600 shadow-sm"
        }
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={index} suppressHydrationWarning className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight 
                  size={14} 
                  className={isTransparent ? "shrink-0 text-white/40" : "shrink-0 text-slate-400"} 
                  aria-hidden="true" 
                />
              )}

              {isLast || !item.href ? (
                <span className={isTransparent ? "text-white max-w-[220px] truncate font-semibold sm:max-w-[440px]" : "text-brand-darkred max-w-[220px] truncate font-semibold sm:max-w-[440px]"}>
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href as any}
                  className={isTransparent ? "hover:text-white rounded-sm font-medium transition-colors duration-150 text-slate-300" : "hover:text-brand-darkred rounded-sm font-medium transition-colors duration-150"}
                >
                  {item.name}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}
