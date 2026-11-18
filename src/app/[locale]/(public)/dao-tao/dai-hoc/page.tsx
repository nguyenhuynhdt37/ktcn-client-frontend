import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowUpRight, BookOpen, Clock3, GraduationCap } from "lucide-react";
import { Link } from "@/i18n/routing";
import { programService, type ProgramSummary } from "@/features/program";
import { TrainingHero } from "@/features/program/components/TrainingHero";
import { Breadcrumb } from "@/shared/components/ui/breadcrumb";
import { constructMetadata } from "@/shared/lib/seo";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const accents = [
  "border-t-brand-blue text-brand-blue bg-sky-50",
  "border-t-brand-darkred text-brand-darkred bg-red-50",
  "border-t-emerald-600 text-emerald-700 bg-emerald-50",
  "border-t-amber-500 text-amber-700 bg-amber-50",
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  return constructMetadata({
    title: isEn ? "Undergraduate programmes" : "Đào tạo đại học",
    description: isEn
      ? "Browse undergraduate engineering programmes, programme codes, duration and academic records at SET VinhUni."
      : "Danh sách chương trình đào tạo đại học, mã ngành, thời gian đào tạo và hồ sơ học thuật tại Trường Kỹ thuật và Công nghệ.",
    slug: isEn ? "academics/undergraduate" : "dao-tao/dai-hoc",
    locale,
    image: "/images/about/activity_itup_1.jpg",
    alternatesLanguages: {
      vi: "dao-tao/dai-hoc",
      en: "academics/undergraduate",
    },
  });
}

function formatDuration(years: number | null | undefined, isEn: boolean) {
  if (!years) return "—";
  return `${years.toLocaleString(isEn ? "en-US" : "vi-VN", {
    maximumFractionDigits: 1,
  })} ${isEn ? "years" : "năm"}`;
}

function ProgrammeCard({
  programme,
  index,
  isEn,
}: {
  programme: ProgramSummary;
  index: number;
  isEn: boolean;
}) {
  const accent = accents[index % accents.length];

  return (
    <article
      className={`flex min-h-72 flex-col rounded-lg border border-t-4 border-slate-200 bg-white p-6 ${accent.split(" ")[0]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`grid size-11 shrink-0 place-items-center rounded-md ${accent.split(" ").slice(1).join(" ")}`}
        >
          <GraduationCap className="size-5" />
        </div>
        <span className="font-mono text-xs font-bold text-slate-500">{programme.code || "—"}</span>
      </div>

      <h2 className="mt-5 text-lg leading-6 font-bold text-slate-950">{programme.name}</h2>
      {programme.short_description && (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {programme.short_description}
        </p>
      )}

      <div className="mt-auto pt-6">
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 pt-4 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5" />
            {formatDuration(programme.duration_years, isEn)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="size-3.5" />
            {isEn ? "Full-time" : "Chính quy"}
          </span>
        </div>
        <Link
          href={{
            pathname: "/dao-tao/dai-hoc/[slug]",
            params: { slug: programme.slug },
          }}
          className="text-brand-darkred mt-5 inline-flex items-center gap-2 text-sm font-bold hover:text-red-800"
        >
          {isEn ? "View programme record" : "Xem hồ sơ chương trình"}
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}

export default async function UndergraduatePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === "en";
  const programmes = await programService.getAll(locale, "bachelor");

  return (
    <div className="min-h-screen bg-[#f5f7f7]">
      <TrainingHero
        eyebrow={isEn ? "Academic programmes" : "Chương trình đào tạo"}
        title={isEn ? "Undergraduate education" : "Đào tạo đại học"}
        description={
          isEn
            ? "Explore engineering programmes, approved academic versions and the study pathways offered by the College of Engineering and Technology."
            : "Khám phá các ngành kỹ thuật, phiên bản chương trình đã phê duyệt và lộ trình học tập tại Trường Kỹ thuật và Công nghệ."
        }
        image="/images/about/activity_itup_1.jpg"
        imageAlt={
          isEn
            ? "Students in an information technology activity"
            : "Sinh viên trong hoạt động công nghệ thông tin"
        }
      />

      <div className="border-b border-slate-200 bg-white">
        <div className="site-container grid grid-cols-2 sm:grid-cols-3">
          <div className="border-r border-slate-200 py-5 pr-4">
            <div className="text-xs font-semibold text-slate-500">
              {isEn ? "Programmes" : "Chương trình"}
            </div>
            <div className="text-brand-blue mt-1 text-2xl font-extrabold">{programmes.length}</div>
          </div>
          <div className="border-r border-slate-200 px-4 py-5">
            <div className="text-xs font-semibold text-slate-500">
              {isEn ? "Degree" : "Văn bằng"}
            </div>
            <div className="mt-1 text-sm font-bold text-slate-950">
              {isEn ? "Engineer" : "Kỹ sư"}
            </div>
          </div>
          <div className="col-span-2 border-t border-slate-200 py-5 sm:col-span-1 sm:border-t-0 sm:pl-4">
            <div className="text-xs font-semibold text-slate-500">
              {isEn ? "Mode" : "Hình thức"}
            </div>
            <div className="mt-1 text-sm font-bold text-slate-950">
              {isEn ? "Full-time" : "Chính quy, tập trung"}
            </div>
          </div>
        </div>
      </div>

      <div className="site-container py-5">
        <Breadcrumb
          items={[
            { name: isEn ? "Home" : "Trang chủ", href: "/" },
            { name: isEn ? "Academics" : "Đào tạo", href: "/dao-tao" },
            { name: isEn ? "Undergraduate" : "Đại học" },
          ]}
        />
      </div>

      <div className="site-container pt-5 pb-16 sm:pt-8 sm:pb-20">
        <div className="mb-8 max-w-3xl">
          <p className="text-brand-darkred text-xs font-bold uppercase">
            {isEn ? "Programme catalogue" : "Danh mục chương trình"}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
            {isEn ? "Choose an engineering pathway" : "Lựa chọn ngành kỹ thuật phù hợp"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-[15px] sm:leading-7">
            {isEn
              ? "Each programme record includes its objectives, learning outcomes, curriculum and available original documents."
              : "Mỗi hồ sơ ngành cung cấp mục tiêu đào tạo, chuẩn đầu ra, khung chương trình và các tài liệu gốc hiện có."}
          </p>
        </div>

        {programmes.length ? (
          <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
            {programmes.map((programme, index) => (
              <ProgrammeCard key={programme.id} programme={programme} index={index} isEn={isEn} />
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
            <p className="mt-2 text-sm text-slate-500">
              {isEn ? "Please return later." : "Vui lòng quay lại sau."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
