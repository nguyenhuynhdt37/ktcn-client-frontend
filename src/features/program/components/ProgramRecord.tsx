"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  Filter,
  GraduationCap,
  Search,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { safePortalHref } from "@/shared/lib/security";
import type { ProgramCourse, ProgramDetail, ProgramVersion } from "../types/program.types";

function formatFileSize(bytes?: number | null) {
  if (!bytes) return null;
  return `${(bytes / 1024 / 1024).toLocaleString("vi-VN", {
    maximumFractionDigits: 2,
  })} MB`;
}

function formatDuration(years: number | null | undefined, isEn: boolean) {
  if (!years) return "—";
  const value = years.toLocaleString(isEn ? "en-US" : "vi-VN", {
    maximumFractionDigits: 1,
  });
  return `${value} ${isEn ? "years" : "năm"}`;
}

function VersionTabs({
  versions,
  selectedId,
  onSelect,
  isEn,
}: {
  versions: ProgramVersion[];
  selectedId: string;
  onSelect: (id: string) => void;
  isEn: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3" role="tablist">
      {versions.map((version) => {
        const active = version.id === selectedId;
        return (
          <button
            key={version.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(version.id)}
            className={`min-h-20 rounded-md border px-4 py-3 text-left transition-colors ${
              active
                ? "border-brand-darkred text-brand-darkred bg-red-50"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            <span className="block font-mono text-sm font-bold">
              {version.version_year}
              {version.cohort_code ? ` · ${version.cohort_code}` : ""}
            </span>
            <span className="mt-1 block text-xs font-semibold">
              {version.is_current
                ? isEn
                  ? "Current"
                  : "Đang áp dụng"
                : isEn
                  ? "Archived"
                  : "Lưu trữ"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Documents({ version, isEn }: { version: ProgramVersion; isEn: boolean }) {
  return (
    <div className="divide-y divide-slate-200 border-y border-slate-200">
      {version.documents.map((document) => {
        const size = formatFileSize(document.file_size);
        const isPdf = document.mime_type === "application/pdf";
        const documentLabel =
          document.document_type === "specification"
            ? isEn
              ? "Programme specification"
              : "Bản mô tả"
            : document.document_type === "source_page"
              ? isEn
                ? "Source page"
                : "Trang dữ liệu nguồn"
              : isEn
                ? "Curriculum and syllabi"
                : "Chương trình và đề cương";
        return (
          <article
            key={document.id}
            className="grid gap-4 py-5 sm:grid-cols-[42px_minmax(0,1fr)_auto] sm:items-center"
          >
            <span className="text-brand-darkred grid size-10 place-items-center rounded-md bg-red-50">
              <FileText className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-brand-darkred text-xs font-bold uppercase">{documentLabel}</p>
              <h3 className="mt-1 text-sm leading-6 font-bold text-slate-900">{document.title}</h3>
              <p className="mt-1 text-xs text-slate-500">
                {isPdf ? "PDF" : isEn ? "Web page" : "Trang web"}
                {document.page_count ? ` · ${document.page_count} ${isEn ? "pages" : "trang"}` : ""}
                {size ? ` · ${size}` : ""}
              </p>
            </div>
            {document.file_url && safePortalHref(document.file_url, "") && (
              <div className="flex items-center gap-2">
                <a
                  href={safePortalHref(document.file_url, "#")}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={isEn ? "Open document" : "Mở tài liệu"}
                  aria-label={`${isEn ? "Open document" : "Mở tài liệu"}: ${document.title}`}
                  className="hover:border-brand-darkred hover:text-brand-darkred grid size-9 place-items-center rounded-md border border-slate-300 text-slate-600"
                >
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
                {isPdf && (
                  <a
                    href={safePortalHref(document.file_url, "#")}
                    download
                    title={isEn ? "Download document" : "Tải tài liệu"}
                    aria-label={`${isEn ? "Download document" : "Tải tài liệu"}: ${document.title}`}
                    className="bg-brand-darkred hover:bg-brand-darkred-dark grid size-9 place-items-center rounded-md text-white"
                  >
                    <Download className="size-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function Curriculum({
  courses,
  isEn,
  numbered = false,
}: {
  courses: ProgramCourse[];
  isEn: boolean;
  numbered?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [semester, setSemester] = useState("all");
  const semesters = useMemo(
    () =>
      Array.from(
        new Set(
          courses
            .map((course) => course.semester)
            .filter((value): value is string => Boolean(value && /^\d+$/.test(value))),
        ),
      ).sort((a, b) => Number(a) - Number(b)),
    [courses],
  );
  const hasSemesters = semesters.length > 0;
  const columnCount = hasSemesters ? 6 : 5;
  const formatBlock = (value?: string | null) => {
    if (!isEn) return value || "—";
    return (
      {
        "Kiến thức bắt buộc": "Required",
        "Kiến thức cơ sở": "Foundation",
        "Kiến thức chuyên ngành": "Specialised",
      }[value || ""] ||
      value ||
      "—"
    );
  };
  const formatCourseType = (value?: string | null) => {
    if (!isEn) return value || "—";
    return { "Bắt buộc": "Required", "Tự chọn": "Elective" }[value || ""] || value || "—";
  };
  const filtered = useMemo(() => {
    if (!query && semester === "all") return courses;
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return courses.filter((course) => {
      if (course.row_type !== "course") return false;
      const matchesSemester = semester === "all" || course.semester === semester;
      const haystack = `${course.course_code ?? ""} ${course.name}`.toLocaleLowerCase();
      return matchesSemester && haystack.includes(normalizedQuery);
    });
  }, [courses, query, semester]);

  return (
    <section id="curriculum" className="scroll-mt-24 border-t border-slate-200 pt-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-brand-blue text-xs font-bold uppercase">
            {isEn ? "Study plan" : "Kế hoạch học tập"}
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">
            {isEn ? "Curriculum" : "Khung chương trình đào tạo"}
          </h2>
        </div>
        <p className="text-xs font-semibold text-slate-500">
          {filtered.length} {isEn ? "rows" : "dòng hiển thị"}
        </p>
      </div>

      <div
        className={`mt-6 grid gap-3 ${hasSemesters ? "sm:grid-cols-[minmax(0,1fr)_210px]" : ""}`}
      >
        <label className="relative block">
          <span className="sr-only">{isEn ? "Search courses" : "Tìm học phần"}</span>
          <Search className="absolute top-3 left-3 size-4 text-slate-400" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isEn ? "Course code or name" : "Mã hoặc tên học phần"}
            className="focus:border-brand-darkred h-10 w-full rounded-md border border-slate-300 bg-white pr-3 pl-9 text-sm outline-none"
          />
        </label>
        {hasSemesters && (
          <label className="relative block">
            <span className="sr-only">{isEn ? "Semester" : "Học kỳ"}</span>
            <Filter className="absolute top-3 left-3 size-4 text-slate-400" aria-hidden="true" />
            <select
              value={semester}
              onChange={(event) => setSemester(event.target.value)}
              className="focus:border-brand-darkred h-10 w-full appearance-none rounded-md border border-slate-300 bg-white pr-9 pl-9 text-sm font-semibold outline-none"
            >
              <option value="all">{isEn ? "All semesters" : "Tất cả học kỳ"}</option>
              {semesters.map((value) => (
                <option key={value} value={value}>
                  {isEn ? `Semester ${value}` : `Học kỳ ${value}`}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-3 right-3 size-4 text-slate-400" />
          </label>
        )}
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table
            className={`w-full text-left text-sm ${hasSemesters ? "min-w-[820px]" : "min-w-[720px]"}`}
          >
            <thead className="bg-slate-900 text-xs text-white">
              <tr>
                <th className="w-24 px-4 py-3">
                  {numbered ? (isEn ? "No." : "TT") : isEn ? "Code" : "Mã HP"}
                </th>
                <th className="px-4 py-3">{isEn ? "Course" : "Tên học phần"}</th>
                <th className="w-20 px-4 py-3 text-center">{isEn ? "Credits" : "TC"}</th>
                {hasSemesters && (
                  <th className="w-20 px-4 py-3 text-center">{isEn ? "Term" : "HK"}</th>
                )}
                <th className="w-28 px-4 py-3">{isEn ? "Block" : "Khối"}</th>
                <th className="w-32 px-4 py-3">{isEn ? "Type" : "Loại"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((course) => {
                if (course.row_type === "group") {
                  return (
                    <tr key={course.id} className="bg-blue-50">
                      <td colSpan={columnCount} className="text-brand-blue px-4 py-3 font-bold">
                        {course.name}
                      </td>
                    </tr>
                  );
                }
                if (course.row_type === "summary") {
                  return (
                    <tr key={course.id} className="bg-slate-900 font-bold text-white">
                      <td colSpan={2} className="px-4 py-3">
                        {course.name}
                      </td>
                      <td className="px-4 py-3 text-center">{course.credits_text}</td>
                      <td colSpan={hasSemesters ? 3 : 2} />
                    </tr>
                  );
                }
                return (
                  <tr key={course.id} className="align-top hover:bg-slate-50">
                    <td className="text-brand-blue px-4 py-3 font-mono text-xs font-bold">
                      {course.course_code || "—"}
                    </td>
                    <td className="px-4 py-3 leading-6 font-medium text-slate-900">
                      {course.name}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {course.credits_text || "—"}
                    </td>
                    {hasSemesters && (
                      <td className="px-4 py-3 text-center text-slate-700">
                        {course.semester || "—"}
                      </td>
                    )}
                    <td className="px-4 py-3 text-xs font-semibold text-slate-600">
                      {formatBlock(course.knowledge_block)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {formatCourseType(course.course_type)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function ProgramRecord({ program, locale }: { program: ProgramDetail; locale: string }) {
  const isEn = locale === "en";
  const isMaster = program.degree_level === "master";
  const programmeLevel = isMaster
    ? isEn
      ? "Master's"
      : "Thạc sĩ"
    : isEn
      ? "Undergraduate"
      : "Đại học";
  const award = isMaster
    ? isEn
      ? program.name
      : program.name.toLowerCase().startsWith("thạc sĩ")
        ? program.name
        : `Thạc sĩ ${program.name}`
    : isEn
      ? "Engineer"
      : "Kỹ sư";
  const initialVersion =
    program.versions.find((version) => version.is_current) ?? program.versions[0];
  const [selectedId, setSelectedId] = useState(initialVersion?.id ?? "");
  const version = program.versions.find((item) => item.id === selectedId) ?? initialVersion;

  if (!version) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* 1. Breadcrumbs */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="site-container flex flex-wrap items-center gap-2 py-5 text-xs font-medium text-slate-500">
          <Link href="/dao-tao" className="hover:text-brand-darkred">
            {isEn ? "Academics" : "Đào tạo"}
          </Link>
          <span className="text-slate-300">/</span>
          <Link
            href={isMaster ? "/dao-tao/sau-dai-hoc" : "/dao-tao/dai-hoc"}
            className="hover:text-brand-darkred"
          >
            {isMaster
              ? isEn
                ? "Postgraduate"
                : "Sau đại học"
              : isEn
                ? "Undergraduate"
                : "Đại học"}
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700">{isEn ? "Programme record" : "Hồ sơ chương trình"}</span>
        </div>
      </div>

      {/* 2. Main Profile Content Container */}
      <article className="site-container bg-white px-4 py-8 sm:px-8 lg:px-10 mt-6 rounded-xl border border-slate-100 shadow-sm">
        <header className="border-b-2 border-slate-900 pb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
            <span className="text-brand-blue font-mono font-bold">{program.code}</span>
            <span className="text-slate-300">/</span>
            <span>
              {isMaster
                ? isEn
                  ? "Master's programme"
                  : "Chương trình thạc sĩ"
                : isEn
                  ? "Undergraduate programme"
                  : "Chương trình đại học"}
            </span>
          </div>
          <h1 className="max-w-4xl text-2xl leading-tight font-extrabold text-slate-950 sm:text-3xl">
            {isEn
              ? program.name
              : isMaster
                ? `Chương trình đào tạo ${program.name}`
                : `Chương trình đào tạo ngành ${program.name}`}
          </h1>
          {program.short_description && (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              {program.short_description}
            </p>
          )}
        </header>

        {program.description && (
          <section className="border-b border-slate-200 py-8">
            <p className="text-brand-blue text-xs font-bold uppercase">
              {isEn ? "Programme overview" : "Tổng quan chương trình"}
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              {isEn ? "Introduction" : "Giới thiệu chung"}
            </h2>
            <p className="mt-4 max-w-4xl text-[15px] leading-7 text-slate-700">
              {program.description}
            </p>
          </section>
        )}

        <section className="border-b border-slate-200 py-8">
          <div className="mb-5">
            <p className="text-brand-darkred text-xs font-bold uppercase">
              {isEn ? "Programme archive" : "Hồ sơ theo phiên bản"}
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              {isEn ? "Programme versions" : "Các phiên bản chương trình"}
            </h2>
          </div>
          <VersionTabs
            versions={program.versions}
            selectedId={version.id}
            onSelect={setSelectedId}
            isEn={isEn}
          />
        </section>

        {version.documents.length > 0 && (
          <section className="border-b border-slate-200 py-9">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-brand-blue text-xs font-bold uppercase">
                  {version.version_year}
                  {version.cohort_code ? ` · ${version.cohort_code}` : ""}
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {isEn ? "Official documents" : "Tài liệu chương trình"}
                </h2>
              </div>
              {version.is_current && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="size-3.5" />
                  {isEn ? "Current" : "Đang áp dụng"}
                </span>
              )}
            </div>
            <Documents version={version} isEn={isEn} />
          </section>
        )}

        <section className="py-10">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <p className="text-xs font-bold text-slate-500 uppercase">
              {isEn
                ? isMaster
                  ? "Postgraduate education programme"
                  : "Full-time undergraduate education programme"
                : isMaster
                  ? "Chương trình đào tạo trình độ thạc sĩ"
                  : "Chương trình giáo dục đại học hệ chính quy"}
            </p>
            <h2 className="mt-2 text-xl leading-7 font-extrabold text-slate-950 uppercase sm:text-2xl">
              {program.name}
            </h2>
          </div>
          <dl className="grid gap-y-3 border-y border-slate-200 py-6 text-sm sm:grid-cols-[200px_1fr] sm:gap-x-8">
            {[
              [isEn ? "Programme name" : "Tên chương trình", program.name],
              [isEn ? "Education level" : "Trình độ đào tạo", programmeLevel],
              [isEn ? "Programme code" : "Mã ngành", program.code ?? "—"],
              [
                isEn ? "Mode of study" : "Loại hình đào tạo",
                isMaster
                  ? isEn
                    ? "Postgraduate education"
                    : "Đào tạo sau đại học"
                  : isEn
                    ? "Full-time"
                    : "Chính quy, tập trung",
              ],
              [
                isEn ? "Duration" : "Thời gian đào tạo",
                formatDuration(program.duration_years, isEn),
              ],
              [isEn ? "Award" : "Văn bằng được cấp", award],
              [
                isEn
                  ? isMaster
                    ? "Taught-course credits"
                    : "Total credits"
                  : isMaster
                    ? "Khối lượng học phần"
                    : "Khối lượng chương trình",
                version.total_credits
                  ? `${version.total_credits} ${isEn ? "credits" : "tín chỉ"}`
                  : "—",
              ],
            ].map(([term, description]) => (
              <div
                key={String(term)}
                className="grid grid-cols-[minmax(120px,200px)_1fr] gap-3 sm:contents"
              >
                <dt className="font-semibold text-slate-600">{term}</dt>
                <dd className="font-bold text-slate-900">{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        {program.admissions_info && (
          <section className="border-t border-slate-200 py-9">
            <div className="mb-4 flex items-center gap-3">
              <span className="bg-brand-darkred grid size-8 place-items-center rounded-md text-sm font-bold text-white">
                A
              </span>
              <h2 className="text-xl font-bold text-slate-950">
                {isEn ? "Admissions subjects" : "Môn thi tuyển sinh"}
              </h2>
            </div>
            <p className="text-[15px] leading-7 text-slate-700">{program.admissions_info}</p>
          </section>
        )}

        {version.general_objective && (
          <section className="border-t border-slate-200 py-9">
            <div className="mb-6 flex items-center gap-3">
              <span className="bg-brand-blue grid size-8 place-items-center rounded-md text-sm font-bold text-white">
                1
              </span>
              <h2 className="text-xl font-bold text-slate-950">
                {isMaster
                  ? isEn
                    ? "Research directions"
                    : "Các hướng nghiên cứu chính"
                  : isEn
                    ? "Programme objectives"
                    : "Mục tiêu đào tạo"}
              </h2>
            </div>
            <h3 className="font-bold text-slate-900 italic">
              {isMaster
                ? isEn
                  ? "Applied and advanced research"
                  : "Nghiên cứu ứng dụng và nghiên cứu chuyên sâu"
                : isEn
                  ? "General objective"
                  : "Mục tiêu chung"}
            </h3>
            <p className="mt-3 text-[15px] leading-7 text-slate-700">{version.general_objective}</p>
            {version.objectives.length > 0 && (
              <div className="mt-7 overflow-hidden rounded-md border border-slate-300">
                {version.objectives.map((objective) => (
                  <div
                    key={objective.id}
                    className="grid grid-cols-[64px_1fr] border-b border-slate-300 last:border-0"
                  >
                    <div className="text-brand-blue grid place-items-center border-r border-slate-300 bg-slate-50 p-3 font-mono text-sm font-bold">
                      {objective.code}
                    </div>
                    <p className="p-3 text-sm leading-6 text-slate-700">{objective.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {version.learning_outcomes.length > 0 && (
          <section className="border-t border-slate-200 py-9">
            <div className="mb-6 flex items-center gap-3">
              <span className="bg-brand-darkred grid size-8 place-items-center rounded-md text-sm font-bold text-white">
                2
              </span>
              <h2 className="text-xl font-bold text-slate-950">
                {isEn ? "Programme learning outcomes" : "Chuẩn đầu ra chương trình"}
              </h2>
            </div>
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {version.learning_outcomes.map((outcome) => (
                <div key={outcome.id} className="grid gap-2 py-4 sm:grid-cols-[90px_1fr]">
                  <span className="text-brand-darkred font-mono text-sm font-bold">
                    {outcome.code}
                  </span>
                  <p className="text-sm leading-6 text-slate-700">{outcome.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {version.career_opportunities && (
          <section className="border-t border-slate-200 py-9">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-md bg-emerald-700 text-white">
                <GraduationCap className="size-4" />
              </span>
              <h2 className="text-xl font-bold text-slate-950">
                {isEn ? "Career opportunities" : "Định hướng việc làm sau tốt nghiệp"}
              </h2>
            </div>
            <p className="text-[15px] leading-7 text-slate-700">{version.career_opportunities}</p>
          </section>
        )}

        {version.courses.length > 0 && (
          <Curriculum courses={version.courses} isEn={isEn} numbered={isMaster} />
        )}

        <footer className="mt-10 flex items-center gap-2 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <BookOpen className="size-4" aria-hidden="true" />
          <span>{version.title}</span>
        </footer>
      </article>
    </div>
  );
}
