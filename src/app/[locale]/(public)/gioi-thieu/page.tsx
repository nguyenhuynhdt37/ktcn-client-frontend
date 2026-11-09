import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { constructMetadata } from "@/shared/lib/seo";
import { serializeJsonLd } from "@/shared/lib/security";
import Image from "next/image";
import {
  AboutOverview,
  AboutVideo,
  AboutTimeline,
  AboutMission,
  AboutDepartments,
  AboutLeadership,
  AboutStats,
  AboutFacilities,
  AboutDomesticPartners,
  AboutAchievements,
  AboutPress,
  AlumniTestimonials,
  AboutStudentLife,
} from "@/features/about";
import { ConsultationCallout } from "@/features/consultation";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AboutPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return constructMetadata({
    title: t("meta_title"),
    description: t("meta_description"),
    locale,
    alternatesLanguages: {
      vi: "gioi-thieu",
      en: "about",
    },
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd([
            {
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": locale === "en" ? "College of Engineering and Technology - Vinh University" : "Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh",
              "alternateName": "SET - VinhUni",
              "url": `https://ktcn.vinhuni.edu.vn/${locale}`,
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "182 Lê Duẩn",
                "addressLocality": "Thành phố Vinh",
                "addressRegion": "Nghệ An",
                "addressCountry": "VN",
              },
              "parentOrganization": {
                "@type": "CollegeOrUniversity",
                "name": "Trường Đại học Vinh",
                "url": "https://vinhuni.edu.vn",
              },
              "foundingDate": "2017-04",
            },
            ...[
              { name: locale === "en" ? "Information Technology" : "Công nghệ thông tin", code: "7480201" },
              { name: locale === "en" ? "Artificial Intelligence" : "Trí tuệ nhân tạo", code: "7480201_AI" },
              { name: locale === "en" ? "Computer Science" : "Khoa học máy tính", code: "7480101" },
              { name: locale === "en" ? "Software Engineering" : "Kỹ thuật phần mềm", code: "7480103" },
              { name: locale === "en" ? "Electrical and Electronic Engineering Technology" : "Công nghệ kỹ thuật Điện, Điện tử", code: "7510301" },
              { name: locale === "en" ? "Control and Automation Engineering Technology" : "Công nghệ kỹ thuật Điều khiển - Tự động hóa", code: "7510303" },
              { name: locale === "en" ? "Automotive Engineering Technology" : "Công nghệ kỹ thuật Ô tô", code: "7510205" },
              { name: locale === "en" ? "Thermal Engineering" : "Kỹ thuật Nhiệt", code: "7520115" },
            ].map(course => ({
              "@context": "https://schema.org",
              "@type": "Course",
              "name": course.name,
              "courseCode": course.code,
              "description": locale === "en"
                ? `Undergraduate education program in ${course.name} at the College of Engineering and Technology, Vinh University.`
                : `Chương trình đào tạo đại học chính quy ngành ${course.name} tại Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh.`,
              "provider": {
                "@type": "EducationalOrganization",
                "name": locale === "en" ? "College of Engineering and Technology - Vinh University" : "Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh",
                "sameAs": "https://ktcn.vinhuni.edu.vn"
              }
            }))
          ]),
        }}
      />

      <AboutOverview />
      <AboutVideo />
      <AboutTimeline />
      <AboutMission />
      <AboutDepartments />
      <AboutLeadership />
      <AboutStats />
      <AboutFacilities />
      <AboutAchievements />
      <AboutDomesticPartners />
      <AboutStudentLife />
      <AlumniTestimonials isEn={locale === "en"} />
      <AboutPress />
      <ConsultationCallout />
    </>
  );
}
