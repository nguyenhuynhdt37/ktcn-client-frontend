"use client";

import { useState, useEffect, useMemo } from "react";
import { Link } from "@/i18n/routing";
import { GraduationCap, CalendarDays, ArrowRight, Pin, LoaderCircle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { SafeImage } from "@/shared/components/ui/safe-image";
import { axiosClient } from "@/shared/api/axios-client";

export interface AdmissionPost {
  id: string | number;
  title: string;
  titleEn?: string;
  excerpt?: string;
  imageUrl: string;
  category: string;
  categoryEn?: string;
  categoryHref: string;
  date: string;
  href: string;
  isPinned?: boolean;
}

export interface TabData {
  id: string;
  labelKey: string;
  posts: AdmissionPost[];
}

const tabCategorySlugMap: Record<string, { vi: string; en: string }> = {
  regular: {
    vi: "tuyen-sinh-dai-hoc-chinh-quy",
    en: "regular-undergraduate-programs",
  },
  "in-service": {
    vi: "dai-hoc-khong-chinh-quy",
    en: "non-formal-higher-education",
  },
  master: {
    vi: "thac-sy",
    en: "masters-degree",
  },
  phd: {
    vi: "tien-sy",
    en: "phd",
  },
  graduate: {
    vi: "tuyen-sinh-cao-hoc-cong-nghe-thong-tin",
    en: "graduate-information-technology",
  },
};

const defaultTabs: TabData[] = [
  {
    id: "regular",
    labelKey: "regular",
    posts: [],
  },
  {
    id: "in-service",
    labelKey: "in_service",
    posts: [],
  },
  {
    id: "master",
    labelKey: "master",
    posts: [],
  },
  {
    id: "phd",
    labelKey: "phd",
    posts: [],
  },
  {
    id: "graduate",
    labelKey: "graduate",
    posts: [],
  },
];

interface AdmissionSectionProps {
  tabs?: TabData[];
  initialArticles?: AdmissionPost[];
  categorySlug?: string;
}

export function AdmissionSection({
  tabs = defaultTabs,
  initialArticles,
  categorySlug = "tuyen-sinh",
}: AdmissionSectionProps) {
  const tCommon = useTranslations("common");
  const tAdmission = useTranslations("admission");
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "regular");
  const [tabPosts, setTabPosts] = useState<Record<string, AdmissionPost[]>>({
    regular: initialArticles && initialArticles.length > 0 ? initialArticles : [],
  });
  const [loadingTabs, setLoadingTabs] = useState<Record<string, boolean>>({});

  const currentSlugs = tabCategorySlugMap[activeTab] || { vi: "tuyen-sinh", en: "admissions" };
  const currentCategorySlug = locale === "en" ? currentSlugs.en : currentSlugs.vi;

  useEffect(() => {
    // Bỏ qua tab regular nếu đã được tải từ SSR
    if (activeTab === "regular" && initialArticles && initialArticles.length > 0) {
      return;
    }
    // Bỏ qua nếu đã tải rồi
    if (tabPosts[activeTab] && tabPosts[activeTab].length > 0) {
      return;
    }

    const fetchTabArticles = async () => {
      setLoadingTabs((prev) => ({ ...prev, [activeTab]: true }));
      try {
        const slug = locale === "en" ? tabCategorySlugMap[activeTab].en : tabCategorySlugMap[activeTab].vi;
        const response = await axiosClient.get<{ items: any[] }>("/api/v1/portal/articles", {
          params: {
            category_slug: slug,
            page: 1,
            page_size: 3,
            sort_by: "published_at",
            sort_dir: "desc",
          },
        });

        const mapped = (response.data.items || []).map((item) => ({
          id: item.id,
          title: item.title,
          titleEn: item.title_en,
          excerpt: item.excerpt || "",
          imageUrl: item.thumbnail_object_key || "/images/no-image-dhv.jpg",
          category: item.category ? item.category.name : "",
          categoryEn: item.category ? item.category.name_en : "",
          categoryHref: `/tin-tuc?category_slug=${slug}`,
          date: new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(new Date(item.published_at || item.created_at)),
          href: `/tin-tuc/${item.slug}`,
          isPinned: item.is_pinned,
        }));

        setTabPosts((prev) => ({ ...prev, [activeTab]: mapped }));
      } catch (error) {
        console.error("Error fetching tab articles:", error);
      } finally {
        setLoadingTabs((prev) => ({ ...prev, [activeTab]: false }));
      }
    };

    fetchTabArticles();
  }, [activeTab, locale, initialArticles]);

  const displayTabs = useMemo(() => {
    return tabs.map((tab) => {
      const dynamicPosts = tabPosts[tab.id];
      if (dynamicPosts && dynamicPosts.length > 0) {
        return {
          ...tab,
          posts: dynamicPosts,
        };
      }
      if (tab.id === "regular" && initialArticles && initialArticles.length > 0) {
        return {
          ...tab,
          posts: initialArticles,
        };
      }
      return tab;
    });
  }, [tabs, tabPosts, initialArticles]);

  const currentTab = displayTabs.find((t) => t.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header tiêu đề */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="section-heading">{tCommon("admission_title")}</h2>
        <Link
          href={`/tin-tuc?category_slug=${currentCategorySlug}` as any}
          className="group text-brand-darkred hover:bg-brand-darkred/5 hover:text-brand-darkred-dark inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-semibold transition-colors duration-150"
        >
          <span>{tCommon("view_all")}</span>
          <ArrowRight
            size={16}
            className="transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>

      {/* Navigation Tab Bar */}
      <div className="border-border overflow-x-auto border-b select-none">
        <div className="-mb-px flex min-w-max gap-1">
          {displayTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              className={`flex min-h-11 items-center gap-1.5 border-b-2 px-3 text-sm font-semibold transition-colors duration-150 ${
                activeTab === tab.id
                  ? "border-brand-darkred text-brand-darkred"
                  : "border-transparent text-slate-600 hover:border-slate-200 hover:text-slate-800"
              }`}
            >
              <GraduationCap size={16} aria-hidden="true" />
              {tAdmission(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Content Tab panel (Grid 3 card đều nhau phẳng đẹp) */}
      <div className="mt-4">
        {loadingTabs[activeTab] ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-slate-400 font-medium">
            <LoaderCircle className="size-5 animate-spin text-brand-blue" aria-hidden="true" />
            <span>{locale === "en" ? "Loading admissions info..." : "Đang tải thông tin tuyển sinh..."}</span>
          </div>
        ) : currentTab && currentTab.posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {currentTab.posts.slice(0, 3).map((post) => {
              const title = locale === "en" ? post.titleEn || post.title : post.title;
              const category = locale === "en" ? post.categoryEn || post.category : post.category;
              return (
                <article
                  key={post.id}
                  className="group border-border hover:border-brand-blue/25 flex flex-col overflow-hidden rounded-xl border bg-white transition-[border-color,transform] duration-200 hover:-translate-y-0.5"
                >
                  <Link
                    href={post.href as any}
                    className="border-border-subtle bg-surface relative block aspect-[16/10] overflow-hidden border-b"
                  >
                    <SafeImage
                      src={post.imageUrl}
                      alt={title}
                      fill
                      sizes="(max-width: 767px) calc(100vw - 3rem), (max-width: 1359px) calc(33.33vw - 2rem), 421px"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />

                    {/* Badge ghim */}
                    {post.isPinned && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="flex items-center gap-1 rounded-md bg-amber-600 px-2 py-1 text-xs font-semibold text-white">
                          <Pin size={12} className="fill-white" aria-hidden="true" />
                          <span>Ghim</span>
                        </span>
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col space-y-3 p-5">
                    <Link href={post.href as any}>
                      <h3 className="group-hover:text-brand-darkred line-clamp-3 text-base leading-snug font-semibold text-slate-800 transition-colors duration-150">
                        {title}
                      </h3>
                    </Link>
                    {post.excerpt && (
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="border-border-subtle mt-auto flex items-center justify-between gap-3 border-t pt-4 text-xs font-medium text-slate-600">
                      <span className="text-brand-darkred max-w-[130px] truncate font-semibold">
                        {category}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays size={14} aria-hidden="true" />
                        <span>{post.date}</span>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-sm font-medium text-slate-400">
            {tAdmission("empty")}
          </div>
        )}
      </div>
    </div>
  );
}
