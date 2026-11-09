import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { constructMetadata, buildBreadcrumbSchema } from "@/shared/lib/seo";
import { serializeJsonLd } from "@/shared/lib/security";
import { departmentService, DepartmentRecord } from "@/features/department";

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

  // Nếu đây không phải là KHOA, Metadata sẽ không sinh cho trang này mà trang chính sẽ redirect.
  // Tuy nhiên ta vẫn trả về metadata cơ bản hoặc để trang page thực hiện redirect.
  if (department.unit_type !== "faculty") {
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
    slug: locale === "en" ? `faculties/${slug}` : `khoa/${slug}`,
    alternatesLanguages: {
      vi: `khoa/${slug}`,
      en: `faculties/${slug}`,
    },
  });
}

export default async function FacultyOverviewPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const overview = await departmentService.getOverview(slug, locale);
  if (!overview) notFound();

  const { department } = overview;
  const isEn = locale === "en";

  // NẾU ĐƠN VỊ KHÔNG PHẢI LÀ KHOA -> CHUYỂN HƯỚNG SANG /bo-mon/[slug]
  if (department.unit_type !== "faculty") {
    redirect(`/${locale}/bo-mon/${slug}`);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `https://ktcn.itup.io.vn/${locale}/${locale === "en" ? "faculties" : "khoa"}/${slug}#department`,
    name: department.name,
    description: department.short_description || department.description || undefined,
    email: department.email || undefined,
    telephone: department.phone || undefined,
    url: department.website || undefined,
    parentOrganization: {
      "@type": "EducationalOrganization",
      name: locale === "en" ? "College of Engineering and Technology - Vinh University" : "Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh",
      url: `https://ktcn.itup.io.vn/${locale}`
    }
  };

  const breadcrumbItems = [
    { name: isEn ? "Home" : "Trang chủ", url: "/" },
    { name: isEn ? "Study Programs" : "Các khoa đào tạo", url: isEn ? "/about/faculties" : "/gioi-thieu/cac-khoa-dao-tao" },
    { name: department.name, url: `/${locale}/${isEn ? "faculties" : "khoa"}/${slug}` }
  ];

  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />
      <DepartmentRecord overview={overview} locale={locale} />
    </>
  );
}
