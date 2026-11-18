import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { constructMetadata } from "@/shared/lib/seo";
import { isCetTheme } from "@/features/cet/utils/theme";
import { CetDocumentList } from "@/features/cet/components/CetDocumentList";
import { getCetDocuments, isDocumentKindSlug } from "@/features/cet/services/document-data";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const isEn = locale === "en";
  const isForms = slug === "van-ban-bieu-mau";
  const title = isForms
    ? isEn
      ? "Documents & forms"
      : "Văn bản – Biểu mẫu"
    : isEn
      ? "Lectures & textbooks"
      : "Bài giảng – Giáo trình";
  return constructMetadata({
    title: `${title} | ${isEn ? "College of Engineering and Technology" : "Trường Kỹ thuật và Công nghệ"}`,
    description: title,
    locale,
    slug: `${isEn ? "documents" : "tai-lieu"}/${slug}`,
    alternatesLanguages: {
      vi: `tai-lieu/${slug}`,
      en: `documents/${slug}`,
    },
  });
}

export default async function DocumentsPage({ params, searchParams }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!isCetTheme() || !isDocumentKindSlug(slug)) notFound();

  const { page, q } = await searchParams;
  const parsed = Number.parseInt(page || "1", 10);
  const data = await getCetDocuments(slug, parsed, (q || "").trim());
  return <CetDocumentList data={data} slug={slug} locale={locale} />;
}
