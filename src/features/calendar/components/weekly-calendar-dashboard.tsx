"use client";

import { Link } from "@/i18n/routing";
import { Calendar, ChevronRight, Clock, User, Printer, ArrowLeft } from "lucide-react";
import { ArticlePagination } from "@/features/article";
import { useTranslations } from "next-intl";
import { sanitizeRichHtml } from "@/shared/lib/security";
import { useParams } from "next/navigation";

interface CalendarListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt: string;
}

interface CalendarDetailItem {
  id: string;
  title: string;
  excerpt?: string | null;
  content: string; // HTML string containing the table
  publishedAt: string;
  authorName?: string;
}

interface WeeklyCalendarDashboardProps {
  activeArticle: CalendarDetailItem;
  listItems: CalendarListItem[];
  activeSlug?: string;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  locale: string;
}

export function WeeklyCalendarDashboard({
  activeArticle,
  listItems,
  activeSlug: passedActiveSlug,
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  locale
}: WeeklyCalendarDashboardProps) {
  const t = useTranslations("calendar");
  const isEn = locale === "en";
  const urlParams = useParams();
  const routeSlug = urlParams?.slug as string;
  
  // Ưu tiên slug từ URL (useParams), nếu không có thì dùng slug truyền xuống, nếu không có nữa thì dùng slug đầu tiên
  const activeSlug = routeSlug || passedActiveSlug || listItems[0]?.slug || "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start select-text">
      {/* 1. Styled styles for inline tables parsed from Word/Excel */}
      <style dangerouslySetInnerHTML={{ __html: `
        .calendar-content-table {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .calendar-content-table table {
          width: 100% !important;
          max-width: 100% !important;
          border-collapse: collapse !important;
          border: 1px solid #e2e8f0 !important;
          margin: 1rem 0 !important;
          font-size: 13.5px !important;
          line-height: 1.6 !important;
          text-align: justify !important;
        }
        .calendar-content-table tr {
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .calendar-content-table tr:hover {
          background-color: rgba(241, 245, 249, 0.4) !important;
        }
        .calendar-content-table td, .calendar-content-table th {
          border: 1px solid #e2e8f0 !important;
          padding: 0.65rem 0.85rem !important;
          vertical-align: middle !important;
          color: #334155 !important;
        }
        .calendar-content-table th, .calendar-content-table tr:first-child td {
          background-color: #f8fafc !important;
          font-weight: bold !important;
          color: #1e293b !important;
          text-transform: uppercase !important;
          font-size: 12px !important;
          letter-spacing: 0.05em !important;
        }
        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .calendar-content-table table {
            font-size: 12px !important;
            display: block !important;
            width: 100% !important;
            overflow-x: auto !important;
          }
        }
        /* 2. Print styles to print ONLY the weekly calendar */
        @media print {
          /* Hide everything in the body by default */
          body * {
            visibility: hidden !important;
          }
          /* Reveal only the print-section and its children */
          #print-section, #print-section * {
            visibility: visible !important;
          }
          #print-section {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          /* Hide elements marked as print-hidden within the print-section */
          #print-section .print-hidden {
            display: none !important;
            visibility: hidden !important;
          }
          /* Style table borders and colors for B&W printing */
          .calendar-content-table table {
            width: 100% !important;
            border: 1px solid #000000 !important;
            border-collapse: collapse !important;
          }
          .calendar-content-table td, .calendar-content-table th {
            border: 1px solid #000000 !important;
            color: #000000 !important;
            padding: 8px 12px !important;
          }
          .calendar-content-table th, .calendar-content-table tr:first-child td {
            background-color: #f1f5f9 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}} />

      {/* 2. Main Area: Selected Week Details (Col Span 9 on Desktop) */}
      <div id="print-section" className="lg:col-span-9 bg-white p-6 sm:p-8 border border-slate-100/60 rounded-sm space-y-6">
        
        {/* Top utility row: Print */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 select-none print-hidden">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-darkred/5 border border-brand-darkred/10 text-brand-darkred">
              <Calendar size={18} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isEn ? "Weekly Calendar" : "Chi tiết lịch công tác tuần"}
            </span>
          </div>

          <button
            onClick={() => typeof window !== "undefined" && window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100/60 hover:bg-slate-100 hover:border-slate-100 transition duration-150 rounded-sm cursor-pointer"
          >
            <Printer size={13} />
            <span>{isEn ? "Print" : "In lịch tuần"}</span>
          </button>
        </div>

        {/* Header information */}
        <div className="space-y-2 text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-tight">
            {activeArticle.title}
          </h1>
          
          {/* Week Date Range */}
          {activeArticle.excerpt && (
            <p className="text-sm font-semibold text-brand-darkred uppercase tracking-wider">
              {activeArticle.excerpt}
            </p>
          )}

          {/* Author and Date metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium pt-1">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              <span>{activeArticle.publishedAt}</span>
            </span>
            {activeArticle.authorName && (
              <span className="flex items-center gap-1">
                <User size={12} />
                <span>{activeArticle.authorName}</span>
              </span>
            )}
          </div>
        </div>

        {/* HTML Table content */}
        <div className="pt-4 overflow-x-auto">
          <div 
            className="calendar-content-table"
            dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(activeArticle.content) }}
          />
        </div>
      </div>

      {/* 3. Sidebar: Week Switcher List (Col Span 3 on Desktop) */}
      <div className="lg:col-span-3 bg-white p-5 border border-slate-100/60 rounded-sm space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
          {isEn ? "Select Week" : "Chọn tuần công tác"}
        </h3>

        {listItems.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">
            {t("no_schedule")}
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {listItems.map((item) => {
              const isActive = item.slug === activeSlug;
              return (
                <Link
                  key={item.id}
                  href={`/lich-tuan/${item.slug}?page=${currentPage}` as any}
                  className={`flex items-start gap-1 p-3 transition-all duration-150 rounded-sm text-left border border-l-4 ${
                    isActive
                      ? "bg-brand-darkred/[0.04] border-brand-darkred/30 border-l-brand-darkred text-brand-darkred font-bold"
                      : "bg-white border-slate-100 border-l-transparent hover:bg-slate-50 hover:border-slate-100 text-slate-700"
                  }`}
                >
                  <ChevronRight 
                    size={14} 
                    className={`mt-0.5 shrink-0 transition-transform ${
                      isActive ? "text-brand-darkred translate-x-0.5" : "text-slate-400"
                    }`} 
                  />
                  <div className="space-y-1.5 min-w-0">
                    <span className={`block text-[13px] leading-snug truncate ${
                      isActive ? "font-bold text-brand-darkred" : "font-bold text-slate-800"
                    }`}>
                      {item.title}
                    </span>
                    {item.excerpt && (
                      <span className={`block text-[11px] leading-none ${
                        isActive ? "text-brand-darkred/80 font-bold" : "text-slate-400 font-medium"
                      }`}>
                        {item.excerpt}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination inside sidebar */}
        {totalPages > 1 && (
          <div className="pt-4 border-t border-slate-100 flex justify-center">
            <ArticlePagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
            />
          </div>
        )}
      </div>
    </div>
  );
}
