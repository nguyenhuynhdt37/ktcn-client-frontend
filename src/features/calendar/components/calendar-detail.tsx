"use client";

import { Link } from "@/i18n/routing";
import { ArrowLeft, Calendar, Clock, User, Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { sanitizeRichHtml } from "@/shared/lib/security";

interface CalendarDetailItem {
  id: string;
  title: string;
  excerpt?: string | null;
  content: string; // HTML string containing the table
  publishedAt: string;
  authorName?: string;
}

interface CalendarDetailProps {
  article: CalendarDetailItem;
}

export function CalendarDetail({ article }: CalendarDetailProps) {
  const t = useTranslations("calendar");

  return (
    <div className="space-y-8 bg-white p-6 sm:p-8 border border-slate-100/60 rounded-sm">
      
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
          margin: 1.5rem 0 !important;
          font-size: 13.5px !important;
          line-height: 1.6 !important;
          text-align: left !important;
        }
        .calendar-content-table tr {
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .calendar-content-table tr:hover {
          background-color: #f8fafc/50 !important;
        }
        .calendar-content-table td, .calendar-content-table th {
          border: 1px solid #e2e8f0 !important;
          padding: 0.75rem 1rem !important;
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
        /* Phản hồi thiết bị di động cho các bảng biểu lớn */
        @media (max-width: 768px) {
          .calendar-content-table table {
            font-size: 12px !important;
            display: block !important;
            width: 100% !important;
            overflow-x: auto !important;
          }
        }
      `}} />

      {/* 2. Top bar: Quay lại & In ấn */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 select-none">
        <Link
          href="/lich-tuan"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-darkred transition-colors duration-150"
        >
          <ArrowLeft size={14} />
          <span>{t("prev_week")}</span>
        </Link>

        <button
          onClick={() => typeof window !== "undefined" && window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100/60 hover:bg-slate-100 hover:border-slate-100 transition duration-150 rounded-sm cursor-pointer "
        >
          <Printer size={13} />
          <span>In lịch tuần</span>
        </button>
      </div>

      {/* 3. Header thông tin */}
      <div className="space-y-3 text-left">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-darkred/5 border border-brand-darkred/10 text-brand-darkred">
            <Calendar size={20} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-tight">
            {article.title}
          </h1>
        </div>
        
        {/* Khoảng thời gian tuần */}
        {article.excerpt && (
          <p className="text-sm font-semibold text-brand-darkred uppercase tracking-wider">
            {article.excerpt}
          </p>
        )}

        {/* Tác giả & Ngày đăng */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium pt-1">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            <span>{article.publishedAt}</span>
          </span>
          {article.authorName && (
            <span className="flex items-center gap-1">
              <User size={12} />
              <span>{article.authorName}</span>
            </span>
          )}
        </div>
      </div>

      {/* 4. Nội dung bảng biểu chi tiết */}
      <div className="pt-4 overflow-x-auto">
        <div 
          className="calendar-content-table select-text"
          dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(article.content) }}
        />
      </div>

    </div>
  );
}
