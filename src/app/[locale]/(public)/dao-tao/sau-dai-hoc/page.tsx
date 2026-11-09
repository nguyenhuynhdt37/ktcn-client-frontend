import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowUpRight, BookOpenCheck, Clock3, GraduationCap } from "lucide-react";
import { Link } from "@/i18n/routing";
import { programService } from "@/features/program";
import { TrainingHero } from "@/features/program/components/TrainingHero";
import { Breadcrumb } from "@/shared/components/ui/breadcrumb";
import { constructMetadata } from "@/shared/lib/seo";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  return constructMetadata({
    title: isEn ? "Postgraduate education" : "Đào tạo sau đại học",
    description: isEn
      ? "Postgraduate programmes and curriculum records at the College of Engineering and Technology, Vinh University."
      : "Chương trình đào tạo sau đại học và hồ sơ khung chương trình tại Trường Kỹ thuật và Công nghệ, Trường Đại học Vinh.",
    slug: isEn ? "academics/postgraduate" : "dao-tao/sau-dai-hoc",
    locale,
    image: "/images/about/activity_predator.jpg",
    alternatesLanguages: {
      vi: "dao-tao/sau-dai-hoc",
      en: "academics/postgraduate",
    },
  });
}

function formatDuration(years: number | null | undefined, isEn: boolean) {
  if (!years) return "—";
  return `${years.toLocaleString(isEn ? "en-US" : "vi-VN", {
    maximumFractionDigits: 1,
  })} ${isEn ? "years" : "năm"}`;
}

export default async function PostgraduatePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === "en";
  const programmes = await programService.getAll(locale, "master");

  return (
    <div className="min-h-screen bg-[#f5f7f7]">
      <TrainingHero
        eyebrow={isEn ? "Advanced study and research" : "Học tập và nghiên cứu chuyên sâu"}
        title={isEn ? "Postgraduate education" : "Đào tạo sau đại học"}
        description={
          isEn
            ? "Explore postgraduate pathways, research directions and published curriculum records in engineering and technology."
            : "Khám phá các chương trình sau đại học, hướng nghiên cứu và hồ sơ chương trình đã công bố trong lĩnh vực kỹ thuật và công nghệ."
        }
        image="/images/about/activity_predator.jpg"
        imageAlt={
          isEn
            ? "Research activity at the College of Engineering and Technology"
            : "Hoạt động nghiên cứu tại Trường Kỹ thuật và Công nghệ"
        }
      />

      <div className="border-b border-slate-200 bg-white">
        <dl className="site-container grid grid-cols-3">
          <div className="border-r border-slate-200 py-5 pr-4">
            <dt className="text-xs font-semibold text-slate-500">
              {isEn ? "Programmes" : "Chương trình"}
            </dt>
            <dd className="text-brand-blue mt-1 text-2xl font-extrabold">{programmes.length}</dd>
          </div>
          <div className="border-r border-slate-200 px-4 py-5">
            <dt className="text-xs font-semibold text-slate-500">{isEn ? "Degree" : "Trình độ"}</dt>
            <dd className="mt-1 text-sm font-bold text-slate-950">
              {isEn ? "Master's" : "Thạc sĩ"}
            </dd>
          </div>
          <div className="py-5 pl-4">
            <dt className="text-xs font-semibold text-slate-500">
              {isEn ? "Orientation" : "Định hướng"}
            </dt>
            <dd className="mt-1 text-sm font-bold text-slate-950">
              {isEn ? "Applied and advanced research" : "Ứng dụng và chuyên sâu"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="site-container py-5">
        <Breadcrumb
          items={[
            { name: isEn ? "Home" : "Trang chủ", href: "/" },
            { name: isEn ? "Academics" : "Đào tạo", href: "/dao-tao" },
            { name: isEn ? "Postgraduate" : "Sau đại học" },
          ]}
        />
      </div>

      <main className="site-container pt-5 pb-20 sm:pt-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-brand-darkred text-xs font-bold uppercase">
            {isEn ? "Programme catalogue" : "Danh mục chương trình"}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
            {isEn ? "Postgraduate pathways" : "Chương trình đào tạo sau đại học"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {isEn
              ? "Each record presents the programme profile, admissions subjects, research directions, curriculum structure and available source documents."
              : "Mỗi hồ sơ trình bày thông tin chương trình, môn thi tuyển sinh, hướng nghiên cứu, khung học phần và tài liệu nguồn hiện có."}
          </p>
        </div>

        {programmes.length ? (
          <div className="divide-y divide-slate-200 border-y border-slate-300 bg-white">
            {programmes.map((programme) => (
              <article
                key={programme.id}
                className="grid gap-6 px-5 py-7 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:items-center sm:px-7"
              >
                <span className="text-brand-blue grid size-14 place-items-center rounded-md bg-sky-50">
                  <GraduationCap className="size-7" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                    <span className="text-brand-blue font-mono font-bold">
                      {programme.code || "—"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-3.5" />
                      {formatDuration(programme.duration_years, isEn)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpenCheck className="size-3.5" />
                      {isEn ? "Curriculum record" : "Hồ sơ chương trình"}
                    </span>
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-slate-950">{programme.name}</h2>
                  {programme.short_description && (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      {programme.short_description}
                    </p>
                  )}
                </div>
                <Link
                  href={{
                    pathname: "/dao-tao/sau-dai-hoc/[slug]",
                    params: { slug: programme.slug },
                  }}
                  className="bg-brand-darkred inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold text-white hover:bg-red-800"
                >
                  {isEn ? "View record" : "Xem hồ sơ"}
                  <ArrowUpRight className="size-4" />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="border-y border-slate-300 bg-white py-16 text-center">
            <GraduationCap className="mx-auto size-9 text-slate-400" />
            <h2 className="mt-4 text-base font-bold text-slate-900">
              {isEn
                ? "Programme information is being updated"
                : "Thông tin chương trình đang được cập nhật"}
            </h2>
          </div>
        )}
      </main>
    </div>
  );
}
