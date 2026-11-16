import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { constructMetadata, buildPersonSchema, buildBreadcrumbSchema } from "@/shared/lib/seo";
import { serializeJsonLd } from "@/shared/lib/security";

import { lecturerService } from "@/features/lecturer";
import { StaffHero, StaffBiography, StaffContactCard } from "@/features/lecturer";
import { Breadcrumb } from "@/shared/components/ui/breadcrumb";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const staff = await lecturerService.getStaffBySlug(slug);
  if (!staff) return { title: locale === "en" ? "Profile not found" : "Không tìm thấy hồ sơ" };
  const role = [staff.academic_title, staff.degree, staff.position?.name].filter(Boolean).join(", ");
  const description = role || (locale === "en" ? "Academic staff profile" : "Hồ sơ cán bộ, giảng viên");

  return constructMetadata({
    title: staff.full_name,
    description,
    locale,
    slug: locale === "en" ? `staffs/${slug}` : `nhan-su/${slug}`,
    alternatesLanguages: {
      vi: `nhan-su/${slug}`,
      en: `staffs/${slug}`,
    },
    type: "profile",
  });
}

export default async function StaffProfilePage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const staff = await lecturerService.getStaffBySlug(slug);
  if (!staff) notFound();

  const isEn = locale === "en";
  const displayName = isEn && staff.english_name ? staff.english_name : staff.full_name;
  const credentials = [staff.academic_title, staff.degree].filter(Boolean).join(", ");

  const jsonLd = buildPersonSchema({
    name: displayName,
    jobTitle: staff.position?.name || credentials || undefined,
    email: staff.email || undefined,
    telephone: staff.phone || undefined,
    image: staff.avatar_object_key || undefined,
    slug,
    locale,
    worksFor: staff.department?.name || undefined,
  });

  const deptSlug = staff.department?.slug || "";
  const isLeadershipDept = deptSlug === "ban-lanh-dao-vien" || deptSlug === "institute-board-of-management";
  const isOfficeDept = deptSlug.startsWith("van-phong");
  const isFacultyDept = deptSlug.startsWith("khoa-") || deptSlug.includes("khoa") || deptSlug.startsWith("faculty-");
  const deptBreadcrumbHref = isLeadershipDept
    ? "/gioi-thieu/can-bo"
    : isOfficeDept
      ? "/gioi-thieu"
      : isFacultyDept
        ? `/khoa/${deptSlug}`
        : `/bo-mon/${deptSlug}`;
  const deptJsonLdUrl = isLeadershipDept
    ? `/${locale}/${isEn ? "about/staff" : "gioi-thieu/can-bo"}`
    : isOfficeDept
      ? `/${locale}/${isEn ? "about" : "gioi-thieu"}`
      : isFacultyDept
        ? `/${locale}/${isEn ? "faculties" : "khoa"}/${deptSlug}`
        : `/${locale}/${isEn ? "departments" : "bo-mon"}/${deptSlug}`;

  const breadcrumbItems = [
    { name: isEn ? "Home" : "Trang chủ", url: "/" },
    ...(staff.department ? [{ name: staff.department.name, url: deptJsonLdUrl }] : []),
    { name: displayName, url: `/${locale}/${isEn ? "staffs" : "nhan-su"}/${slug}` },
  ];

  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);

  return (
    <div className="bg-background min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />

      {/* Hero Banner Section */}
      <StaffHero
        staff={staff}
        displayName={displayName}
        credentials={credentials}
      />

      {/* Breadcrumb Section */}
      <div className="site-container py-6">
        <Breadcrumb
          items={[
            { name: isEn ? "Home" : "Trang chủ", href: "/" },
            ...(staff.department ? [{ 
              name: staff.department.name, 
              href: deptBreadcrumbHref
            }] : []),
            { name: displayName },
          ]}
        />
      </div>

      {/* Main Details and Sidebar Contact Card */}
      <section className="pb-14 md:pb-20">
        <div className="site-container grid gap-8 lg:grid-cols-[1fr_320px] items-start">
          {/* Biography Content Card */}
          <StaffBiography staff={staff} isEn={isEn} />

          {/* Sidebar Contact Info Card */}
          <StaffContactCard staff={staff} isEn={isEn} />
        </div>
      </section>
    </div>
  );
}
