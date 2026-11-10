// src/app/[locale]/(public)/page.tsx
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { constructMetadata } from "@/shared/lib/seo";
import Image from "next/image";
import { HomeHeroWidget } from "@/features/banner/components/HomeHeroWidget";
import { BannerPosition } from "@/features/banner/types/banner.types";
import { bannerService } from "@/features/banner/services/bannerService";
import { ServicesBar } from "@/features/menu/components/ServicesBar";
import { MarqueeNotice } from "@/features/notification/components/MarqueeNotice";
import { AdmissionSection } from "@/features/admission/components/AdmissionSection";
import { ConsultationCallout } from "@/features/consultation/components/ConsultationCallout";
import { NewsSection } from "@/features/article/components/NewsGrid";
import { RecruitmentWidget } from "@/features/article/components/RecruitmentWidget";
import { articleService } from "@/features/article/services/articleService";
import { mapPortalArticleToFE, getLocalizedField, formatDate } from "@/features/article/utils/map-article";
import { ResearchSection } from "@/features/research/components/ResearchSection";
import { StudentActivities } from "@/features/student/components/StudentActivities";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps) {
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

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  // Cấu hình static rendering locale
  setRequestLocale(locale);
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const newsCategorySlug = "tin-tuc-va-su-kien";
  const researchCategorySlug = "nghien-cuu-khoa-hoc";
  const studentCategorySlug = "sinh-vien";
  const admissionCategorySlug = "tuyen-sinh-dai-hoc-chinh-quy";
  const recruitmentCategorySlug = "tuyen-dung";
  const trainingCategorySlug = "dao-tao";

  // 1. Fetch Banner Slider
  const heroBannersPromise = bannerService.getBanners(BannerPosition.HOME_HERO);

  // 2. Fetch các danh mục bài viết song song để tối ưu tốc độ tải trang
  const newsArticlesPromise = articleService.getArticlesByCategory(newsCategorySlug, 1, 10);
  const noticePromise = articleService.getArticlesByCategory("thong-bao", 1, 5);
  const admissionPromise = articleService.getArticlesByCategory(admissionCategorySlug, 1, 3);
  const studentPromise = articleService.getArticlesByCategory(studentCategorySlug, 1, 4);
  const recruitmentPromise = articleService.getArticlesByCategory(recruitmentCategorySlug, 1, 4);
  const researchPromise = articleService.getArticlesByCategory(researchCategorySlug, 1, 7);
  const trainingPromise = articleService.getArticlesByCategory(trainingCategorySlug, 1, 3);

  // Chờ tất cả API hoàn thành cùng lúc
  const [
    heroBanners,
    newsArticlesData,
    noticeData,
    admissionData,
    studentData,
    recruitmentData,
    researchData,
    trainingData,
  ] = await Promise.all([
    heroBannersPromise,
    newsArticlesPromise,
    noticePromise,
    admissionPromise,
    studentPromise,
    recruitmentPromise,
    researchPromise,
    trainingPromise,
  ]);

  const rawNewsArticles = newsArticlesData?.items || [];

  // Dữ liệu chạy chữ nóng (Marquee) lấy từ 5 tin tức mới nhất
  const marqueeNotices = rawNewsArticles.slice(0, 5).map((item) => ({
    id: item.id,
    title: getLocalizedField<string>(item, "title", locale),
    href: `/tin-tuc/${item.slug}`,
  }));

  // Tin tức hiển thị trong Tab tin tức
  const newsArticles = rawNewsArticles.slice(0, 3).map((item) => mapPortalArticleToFE(item, locale));

  const noticeList =
    noticeData?.items.map((item) => ({
      id: item.id,
      title: getLocalizedField<string>(item, "title", locale),
      date: formatDate(item.published_at, locale),
      href: `/tin-tuc/${item.slug}`,
    })) || [];

  const admissionList =
    admissionData?.items.map((item) => ({
      id: item.id,
      title: getLocalizedField<string>(item, "title", locale),
      excerpt: getLocalizedField<string>(item, "excerpt", locale),
      imageUrl: item.thumbnail_object_key || "/images/no-image-dhv.jpg",
      category: item.category ? getLocalizedField<string>(item.category, "name", locale) : "",
      categoryHref: `/tin-tuc?category_slug=${item.category?.slug || ""}`,
      date: formatDate(item.published_at, locale),
      href: `/tin-tuc/${item.slug}`,
      isPinned: item.is_pinned,
    })) || [];

  const studentList = studentData?.items.map((item) => mapPortalArticleToFE(item, locale)) || [];

  const recruitmentList =
    recruitmentData?.items.map((item) => ({
      id: item.id,
      title: getLocalizedField<string>(item, "title", locale),
      date: formatDate(item.published_at, locale),
      href: `/tin-tuc/${item.slug}`,
    })) || [];

  const researchArticles =
    researchData?.items.map((item) => ({
      id: item.id,
      title: getLocalizedField<string>(item, "title", locale),
      excerpt: getLocalizedField<string>(item, "excerpt", locale),
      imageUrl: item.thumbnail_object_key || "/images/no-image-dhv.jpg",
      category: item.category ? getLocalizedField<string>(item.category, "name", locale) : "",
      categoryHref: `/tin-tuc?category_slug=${item.category?.slug || ""}`,
      date: formatDate(item.published_at, locale),
      href: `/tin-tuc/${item.slug}`,
      isPinned: item.is_pinned,
    })) || [];

  const trainingArticles =
    trainingData?.items.map((item) => ({
      id: item.id,
      title: getLocalizedField<string>(item, "title", locale),
      excerpt: getLocalizedField<string>(item, "excerpt", locale),
      imageUrl: item.thumbnail_object_key || "/images/no-image-dhv.jpg",
      category: item.category ? getLocalizedField<string>(item.category, "name", locale) : "",
      categoryHref: `/tin-tuc?category_slug=${item.category?.slug || ""}`,
      date: formatDate(item.published_at, locale),
      href: `/tin-tuc/${item.slug}`,
      isPinned: item.is_pinned,
    })) || [];

  return (
    <>
      {/* 1. Hero Slider + Bảng thông báo */}
      <HomeHeroWidget banners={heroBanners} notices={noticeList} locale={locale} />

      {/* Chữ chạy tin nóng (Marquee) */}
      <MarqueeNotice notices={marqueeNotices} />

      {/* 2. Dịch vụ nhanh */}
      <ServicesBar />

      <main className="w-full">
        {/* 3. Tin tức & Sự kiện */}
        <div className="py-14 md:py-20 max-w-[1360px] mx-auto px-6">
          <NewsSection articles={newsArticles} categorySlug={newsCategorySlug} />
        </div>

        {/* 4. Chương trình Đào tạo */}
        <div className="py-14 md:py-20 bg-slate-50/40 border-y border-slate-100/60 w-full">
          <div className="max-w-[1360px] mx-auto px-6">
            <NewsSection
              articles={trainingArticles}
              categorySlug={trainingCategorySlug}
              title={tCommon("education_title")}
            />
          </div>
        </div>

        {/* 5. Nghiên cứu khoa học */}
        <div className="py-14 md:py-20 max-w-[1360px] mx-auto px-6">
          <ResearchSection articles={researchArticles} categorySlug={researchCategorySlug} />
        </div>

        {/* 6. Hoạt động sinh viên */}
        <StudentActivities activities={studentList} categorySlug={studentCategorySlug} />

        {/* 7. Tuyển sinh + Tuyển dụng */}
        <div className="py-14 md:py-20 max-w-[1360px] mx-auto px-6 border-t border-slate-100">
          <div className="space-y-12">
            <AdmissionSection initialArticles={admissionList} categorySlug={admissionCategorySlug} />
            <RecruitmentWidget items={recruitmentList} categorySlug={recruitmentCategorySlug} />
          </div>
        </div>
      </main>

      {/* 7. Biểu mẫu đăng ký tư vấn tuyển sinh */}
      <ConsultationCallout />

      {/* Background Overlay Layer with Watercolor Leaves for Homepage only (overflow-hidden prevents empty bottom space) */}
      <div className="absolute inset-x-0 top-6 bottom-0 z-20 pointer-events-none select-none overflow-hidden">
        {/* Leaves top-left (Shifted below banner to top-[750px] and made darker) */}
        <div className="absolute top-[750px] -left-16 w-64 h-64 md:w-80 md:h-80 opacity-[0.16] rotate-[35deg] mix-blend-multiply animate-leaf-left">
          <Image
            src="/images/about/watercolor_leaves.png"
            alt="Leaf Background Dec"
            fill
            sizes="(max-width: 768px) 200px, 320px"
            className="object-contain"
          />
        </div>

        {/* Leaves top-right (at 1400px) */}
        <div className="absolute top-[1400px] -right-16 w-64 h-64 md:w-80 md:h-80 opacity-[0.15] -rotate-[45deg] scale-x-[-1] mix-blend-multiply animate-leaf-right">
          <Image
            src="/images/about/watercolor_leaves.png"
            alt="Leaf Background Dec"
            fill
            sizes="(max-width: 768px) 200px, 320px"
            className="object-contain"
          />
        </div>

        {/* Leaves mid-left (at 2100px) */}
        <div className="absolute top-[2100px] -left-20 w-72 h-72 md:w-96 md:h-96 opacity-[0.14] rotate-[15deg] mix-blend-multiply animate-leaf-mid-left">
          <Image
            src="/images/about/watercolor_leaves.png"
            alt="Leaf Background Dec"
            fill
            sizes="(max-width: 768px) 250px, 380px"
            className="object-contain"
          />
        </div>

        {/* Leaves mid-right (at 2800px) */}
        <div className="absolute top-[2800px] -right-20 w-72 h-72 md:w-96 md:h-96 opacity-[0.15] -rotate-[25deg] scale-y-[-1] mix-blend-multiply animate-leaf-mid-right">
          <Image
            src="/images/about/watercolor_leaves.png"
            alt="Leaf Background Dec"
            fill
            sizes="(max-width: 768px) 250px, 380px"
            className="object-contain"
          />
        </div>

        {/* Leaves bottom-left (at 3500px) */}
        <div className="absolute top-[3500px] -left-16 w-72 h-72 md:w-80 md:h-80 opacity-[0.16] rotate-[75deg] mix-blend-multiply animate-leaf-bottom-left">
          <Image
            src="/images/about/watercolor_leaves.png"
            alt="Leaf Background Dec"
            fill
            sizes="(max-width: 768px) 200px, 320px"
            className="object-contain"
          />
        </div>

        {/* Leaves bottom-right (anchored to bottom) */}
        <div className="absolute bottom-10 -right-16 w-80 h-80 md:w-96 md:h-96 opacity-[0.18] rotate-[115deg] scale-x-[-1] mix-blend-multiply animate-leaf-bottom-right">
          <Image
            src="/images/about/watercolor_leaves.png"
            alt="Leaf Background Dec"
            fill
            sizes="(max-width: 768px) 250px, 380px"
            className="object-contain"
          />
        </div>
      </div>
    </>
  );
}
