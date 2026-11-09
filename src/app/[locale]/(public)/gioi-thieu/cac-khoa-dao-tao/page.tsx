import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { constructMetadata } from "@/shared/lib/seo";
import { departmentService, FacultiesList } from "@/features/department";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  const title = isEn 
    ? "Faculties & Programs - College of Engineering & Technology" 
    : "Các khoa đào tạo - Trường Kỹ thuật và Công nghệ";
  const description = isEn
    ? "Explore the specialized faculties and academic programs offered by the College of Engineering and Technology, Vinh University."
    : "Danh sách các khoa chuyên ngành và chương trình đào tạo tại Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh.";

  return constructMetadata({
    title,
    description,
    locale,
    slug: isEn ? "about/faculties" : "gioi-thieu/cac-khoa-dao-tao",
    alternatesLanguages: {
      vi: "gioi-thieu/cac-khoa-dao-tao",
      en: "about/faculties",
    },
  });
}

export default async function FacultiesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch all departments of type "faculty" from the CMS API
  const faculties = (await departmentService.getDepartments({ 
    unit_type: "faculty",
    lang: locale
  })) || [];

  // Sort faculties by sort_order
  const sortedFaculties = [...faculties].sort((a, b) => a.sort_order - b.sort_order);

  return <FacultiesList faculties={sortedFaculties} locale={locale} />;
}
