import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, BookOpenCheck, GraduationCap, ListChecks, Target } from "lucide-react";
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
    title: isEn ? "Academic programmes" : "Đào tạo",
    description: isEn
      ? "Explore undergraduate engineering programmes at the College of Engineering and Technology, Vinh University."
      : "Tổng quan hoạt động đào tạo và các chương trình đại học của Trường Kỹ thuật và Công nghệ, Trường Đại học Vinh.",
    slug: isEn ? "academics" : "dao-tao",
    locale,
    image: "/images/about/activity_chmt_1.jpg",
    alternatesLanguages: { vi: "dao-tao", en: "academics" },
  });
}

function durationRange(values: Array<number | null | undefined>, isEn: boolean) {
  const durations = values.filter((value): value is number => Boolean(value));
  if (!durations.length) return "—";
  const min = Math.min(...durations);
  const max = Math.max(...durations);
  const format = (value: number) =>
    value.toLocaleString(isEn ? "en-US" : "vi-VN", { maximumFractionDigits: 1 });
  return `${format(min)}${min === max ? "" : `–${format(max)}`} ${isEn ? "years" : "năm"}`;
}

export default async function TrainingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === "en";
  const [programmes, postgraduateProgrammes] = await Promise.all([
    programService.getAll(locale, "bachelor"),
    programService.getAll(locale, "master"),
  ]);
  const durations = durationRange(
    [...programmes, ...postgraduateProgrammes].map((programme) => programme.duration_years),
    isEn,
  );

  const pillars = [
    {
      icon: Target,
      title: isEn ? "Programme objectives" : "Mục tiêu đào tạo",
      description: isEn
        ? "Professional capability, personal qualities and the development path expected of graduates."
        : "Năng lực nghề nghiệp, phẩm chất cá nhân và định hướng phát triển của người học sau tốt nghiệp.",
      color: "text-brand-darkred bg-red-50",
    },
    {
      icon: ListChecks,
      title: isEn ? "Learning outcomes" : "Chuẩn đầu ra",
      description: isEn
        ? "Knowledge, skills and levels of autonomy are organised by each approved programme version."
        : "Kiến thức, kỹ năng và mức độ tự chủ được hệ thống theo từng phiên bản chương trình.",
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      icon: BookOpenCheck,
      title: isEn ? "Curriculum" : "Khung chương trình",
      description: isEn
        ? "Courses, credits, semesters and elective pathways form a transparent study plan."
        : "Học phần, tín chỉ, học kỳ và các nhóm tự chọn tạo thành lộ trình học tập rõ ràng.",
      color: "text-brand-blue bg-sky-50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f7]">
      <TrainingHero
        eyebrow={isEn ? "College of Engineering and Technology" : "Trường Kỹ thuật và Công nghệ"}
        title={isEn ? "Academic programmes" : "Đào tạo"}
        description={
          isEn
            ? "Engineering programmes connect foundational knowledge, professional practice and the ability to adapt to a changing technology landscape."
            : "Các chương trình kỹ thuật kết nối kiến thức nền tảng, thực hành nghề nghiệp và năng lực thích ứng trước sự thay đổi của công nghệ."
        }
        image="/images/about/activity_chmt_1.jpg"
        imageAlt={
          isEn
            ? "Engineering students in an academic activity"
            : "Sinh viên kỹ thuật trong hoạt động học tập"
        }
      />

      <div className="site-container py-5">
        <Breadcrumb
          items={[
            { name: isEn ? "Home" : "Trang chủ", href: "/" },
            { name: isEn ? "Academics" : "Đào tạo" },
          ]}
        />
      </div>

      <main>
        <section className="site-container grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:py-14">
          <div className="max-w-3xl">
            <p className="text-brand-darkred text-xs font-bold uppercase">
              {isEn ? "Engineering education" : "Giáo dục kỹ thuật"}
            </p>
            <h2 className="mt-2 text-2xl leading-tight font-bold text-slate-950 sm:text-3xl">
              {isEn
                ? "A structured path from foundations to engineering practice"
                : "Lộ trình từ nền tảng đến thực hành kỹ thuật"}
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-slate-600">
              {isEn
                ? "Each programme publishes its objectives, learning outcomes, curriculum and original academic documents so learners can review the complete study pathway."
                : "Mỗi chương trình công bố mục tiêu, chuẩn đầu ra, khung học phần và tài liệu học thuật gốc để người học có thể theo dõi đầy đủ lộ trình đào tạo."}
            </p>
          </div>

          <dl className="grid grid-cols-3 border-y border-slate-300 bg-white">
            <div className="border-r border-slate-200 px-5 py-5">
              <dt className="text-xs font-semibold text-slate-500">
                {isEn ? "Undergraduate programmes" : "Chương trình đại học"}
              </dt>
              <dd className="text-brand-blue mt-2 text-3xl font-extrabold">{programmes.length}</dd>
            </div>
            <div className="border-r border-slate-200 px-5 py-5">
              <dt className="text-xs font-semibold text-slate-500">
                {isEn ? "Postgraduate" : "Sau đại học"}
              </dt>
              <dd className="text-brand-darkred mt-2 text-3xl font-extrabold">
                {postgraduateProgrammes.length}
              </dd>
            </div>
            <div className="px-5 py-5">
              <dt className="text-xs font-semibold text-slate-500">
                {isEn ? "Typical duration" : "Thời gian đào tạo"}
              </dt>
              <dd className="mt-2 text-lg font-bold text-slate-950">{durations}</dd>
            </div>
          </dl>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="site-container grid lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="border-b border-slate-200 py-10 lg:border-r lg:border-b-0 lg:py-12 lg:pr-10">
              <div className="text-brand-darkred grid size-11 place-items-center rounded-md bg-red-50">
                <GraduationCap className="size-6" />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-slate-950">
                {isEn ? "Undergraduate education" : "Đào tạo đại học"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {isEn
                  ? "Full-time engineering programmes with programme records organised by approved version."
                  : "Các chương trình kỹ sư hệ chính quy, có hồ sơ học thuật được tổ chức theo từng phiên bản phê duyệt."}
              </p>
              <Link
                href="/dao-tao/dai-hoc"
                className="bg-brand-darkred mt-6 inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-bold text-white transition-colors hover:bg-red-800"
              >
                {isEn ? "View all programmes" : "Xem tất cả chương trình"}
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="py-3 lg:pl-10">
              {programmes.length ? (
                <div className="grid md:grid-cols-2">
                  {programmes.map((programme, index) => (
                    <Link
                      key={programme.id}
                      href={{
                        pathname: "/dao-tao/dai-hoc/[slug]",
                        params: { slug: programme.slug },
                      }}
                      className={`group hover:text-brand-darkred flex min-h-20 items-center justify-between gap-4 border-slate-200 py-4 transition-colors md:px-5 ${
                        index < programmes.length - 2 ? "border-b" : ""
                      } ${index % 2 === 0 ? "md:border-r" : ""}`}
                    >
                      <span className="min-w-0">
                        <span className="text-brand-blue block font-mono text-xs font-bold">
                          {programme.code || "—"}
                        </span>
                        <span className="group-hover:text-brand-darkred mt-1 block text-sm font-semibold text-slate-900">
                          {programme.name}
                        </span>
                      </span>
                      <ArrowRight className="group-hover:text-brand-darkred size-4 shrink-0 text-slate-400" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
                  {isEn
                    ? "Programme information is being updated."
                    : "Thông tin chương trình đang được cập nhật."}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-slate-900 text-white">
          <div className="site-container grid gap-8 py-10 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-center lg:py-12">
            <div>
              <p className="text-xs font-bold text-sky-300 uppercase">
                {isEn ? "Advanced study" : "Nghiên cứu chuyên sâu"}
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                {isEn ? "Postgraduate education" : "Đào tạo sau đại học"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {isEn
                  ? "Master's programme records include admissions subjects, research directions and the published curriculum."
                  : "Hồ sơ chương trình thạc sĩ gồm môn thi tuyển sinh, hướng nghiên cứu và khung học phần đã công bố."}
              </p>
              <Link
                href="/dao-tao/sau-dai-hoc"
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-bold text-slate-950 hover:bg-slate-100"
              >
                {isEn ? "View postgraduate programmes" : "Xem chương trình sau đại học"}
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-700 border-y border-slate-700">
              {postgraduateProgrammes.map((programme) => (
                <Link
                  key={programme.id}
                  href={{
                    pathname: "/dao-tao/sau-dai-hoc/[slug]",
                    params: { slug: programme.slug },
                  }}
                  className="group flex min-h-24 items-center justify-between gap-5 py-5 lg:px-5"
                >
                  <span>
                    <span className="block font-mono text-xs font-bold text-sky-300">
                      {programme.code || "—"}
                    </span>
                    <span className="mt-1 block text-base font-bold group-hover:text-sky-200">
                      {programme.name}
                    </span>
                  </span>
                  <ArrowRight className="size-5 shrink-0 text-slate-400 group-hover:text-white" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="site-container py-12 sm:py-16">
          <div className="mb-8 max-w-2xl">
            <p className="text-brand-darkred text-xs font-bold uppercase">
              {isEn ? "Programme structure" : "Cấu trúc chương trình"}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              {isEn ? "Academic information by programme" : "Thông tin học thuật theo từng ngành"}
            </h2>
          </div>
          <div className="grid gap-8 border-t border-slate-300 pt-8 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, description, color }) => (
              <article key={title} className="min-w-0">
                <div className={`grid size-10 place-items-center rounded-md ${color}`}>
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
