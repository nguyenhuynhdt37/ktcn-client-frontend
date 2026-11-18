import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { constructMetadata, buildBreadcrumbSchema, BASE_URL } from "@/shared/lib/seo";
import { serializeJsonLd } from "@/shared/lib/security";
import { departmentService, DepartmentRecord } from "@/features/department";
import { isLeadershipUnit } from "@/features/department/components/LeadershipGroups";
import { isCetTheme } from "@/features/cet/utils/theme";
import { CetLeadership } from "@/features/cet/components/CetLeadership";
import { CetFaculty } from "@/features/cet/components/CetFaculty";
import { getCetFacultySummaries } from "@/features/cet/services/department-data";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const overview = await departmentService.getOverview(slug, locale);
  if (!overview) return { title: locale === "en" ? "Unit not found" : "Không tìm thấy đơn vị" };
  const department = overview.department;

  // Nếu là khoa thì trang chính sẽ tự redirect
  if (department.unit_type === "faculty") {
    return {};
  }

  const fallbackDescription = locale === "en"
    ? `Information about the ${department.name} at the College of Engineering and Technology, Vinh University.`
    : `Thông tin giới thiệu về ${department.name} tại Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh.`;

  const rawDescription = department.seo_description || department.short_description || department.description || fallbackDescription;
  const cleanDescription = stripHtml(rawDescription).slice(0, 160) || fallbackDescription;

  return constructMetadata({
    title: department.seo_title || department.name,
    description: cleanDescription,
    locale,
    slug: locale === "en" ? `departments/${slug}` : `bo-mon/${slug}`,
    alternatesLanguages: {
      vi: `bo-mon/${slug}`,
      en: `departments/${slug}`,
    },
  });
}

export default async function DepartmentOverviewPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const overview = await departmentService.getOverview(slug, locale);
  if (!overview) notFound();

  const { department } = overview;
  const isEn = locale === "en";

  // NẾU ĐƠN VỊ LÀ KHOA -> CHUYỂN HƯỚNG SANG /khoa/[slug]
  if (department.unit_type === "faculty") {
    const encodedSlug = encodeURIComponent(slug);
    redirect(isEn ? `/en/faculties/${encodedSlug}` : `/vi/khoa/${encodedSlug}`);
  }

  const siteUrl = BASE_URL.replace(/\/+$/, "");
  const encodedSlug = encodeURIComponent(slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${siteUrl}/${locale}/${isEn ? "departments" : "bo-mon"}/${encodedSlug}#department`,
    name: department.name,
    description: department.short_description || department.description || undefined,
    email: department.email || undefined,
    telephone: department.phone || undefined,
    url: department.website || undefined,
    parentOrganization: {
      "@type": "EducationalOrganization",
      name: isEn ? "College of Engineering and Technology - Vinh University" : "Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh",
      url: `${siteUrl}/${locale}`
    }
  };

  const breadcrumbItems = [
    { name: isEn ? "Home" : "Trang chủ", url: "/" },
    { name: isEn ? "Study Programs" : "Các khoa đào tạo", url: isEn ? "/about/faculties" : "/gioi-thieu/cac-khoa-dao-tao" },
    { name: department.name, url: `/${locale}/${isEn ? "departments" : "bo-mon"}/${slug}` }
  ];

  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);

  let content = <DepartmentRecord overview={overview} locale={locale} />;
  if (isCetTheme()) {
    if (isLeadershipUnit(department.slug)) {
      content = (
        <CetLeadership
          overview={overview}
          faculties={await getCetFacultySummaries(locale)}
          locale={locale}
        />
      );
    } else {
      content = <CetFaculty overview={overview} locale={locale} />;
    }
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />
      {content}
    </>
  );
}
