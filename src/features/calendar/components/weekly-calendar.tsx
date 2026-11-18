import { Link } from "@/i18n/routing";
import { WeekSchedule } from "../types/calendar.types";
import { ChevronLeft, ChevronRight, Calendar, MapPin, User, Users, Clock } from "lucide-react";
import { getLocale } from "next-intl/server";
import { getMonday, formatDateString } from "../services/mock-calendar-service";

interface WeeklyCalendarProps {
  schedule: WeekSchedule;
  currentDateStr: string; // YYYY-MM-DD to highlight today
}

// Hàm cộng/trừ ngày (7 ngày để chuyển tuần)
function addWeeks(dateStr: string, weeks: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + weeks * 7);
  return formatDateString(date);
}

export async function WeeklyCalendar({ schedule, currentDateStr }: WeeklyCalendarProps) {
  const locale = await getLocale();
  const isEn = locale === "en";

  // Định dạng ngày hiển thị dd/mm
  const formatDayDate = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length < 3) return dateStr;
    return `${parts[2]}/${parts[1]}`;
  };

  // Lấy nhãn của thứ trong tuần
  const getDayOfWeekLabel = (dayOfWeek: number, dateStr: string) => {
    if (isEn) {
      const daysEn = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      return `${daysEn[dayOfWeek - 2]} (${formatDayDate(dateStr)})`;
    }
    const daysVi = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
    return `${daysVi[dayOfWeek - 2]} (${formatDayDate(dateStr)})`;
  };

  // Xác định xem ngày đó có phải là hôm nay hay không
  const isToday = (dateStr: string) => dateStr === currentDateStr;

  // Lấy ngày Thứ Hai hiện tại, trước và sau
  const currentWeekMonday = schedule.weekStartDate;
  const prevWeekMonday = addWeeks(currentWeekMonday, -1);
  const nextWeekMonday = addWeeks(currentWeekMonday, 1);
  const thisWeekMonday = formatDateString(getMonday(new Date()));

  // Tiêu đề khoảng thời gian tuần
  const formatHeaderDate = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length < 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const startFormatted = formatHeaderDate(schedule.weekStartDate);
  const endFormatted = formatHeaderDate(schedule.weekEndDate);

  return (
    <div className="space-y-8 bg-white p-6 sm:p-8 border border-slate-100/60 rounded-sm">
      
      {/* 1. Header & Điều hướng tuần */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-darkred/5 border border-brand-darkred/10 text-brand-darkred">
              <Calendar size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              {isEn ? "Weekly Working Calendar" : "Lịch Công Tác Tuần"}
            </h1>
          </div>
          <p className="text-sm font-semibold text-brand-darkred/90 tracking-wide uppercase">
            {isEn 
              ? `Week: ${startFormatted} - ${endFormatted}`
              : `Tuần từ: ${startFormatted} đến ${endFormatted}`}
          </p>
        </div>

        {/* Bộ nút chuyển đổi tuần */}
        <div className="flex flex-wrap items-center gap-2 select-none self-start md:self-center">
          <Link
            href={`/lich-tuan?week=${prevWeekMonday}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-100/60 hover:border-brand-darkred hover:text-brand-darkred transition duration-150 rounded-sm cursor-pointer "
          >
            <ChevronLeft size={14} />
            <span>{isEn ? "Prev Week" : "Tuần trước"}</span>
          </Link>

          <Link
            href={`/lich-tuan?week=${thisWeekMonday}`}
            className="inline-flex items-center px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100/60 hover:bg-slate-100 hover:border-slate-100 transition duration-150 rounded-sm cursor-pointer "
          >
            {isEn ? "Current Week" : "Tuần này"}
          </Link>

          <Link
            href={`/lich-tuan?week=${nextWeekMonday}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-100/60 hover:border-brand-darkred hover:text-brand-darkred transition duration-150 rounded-sm cursor-pointer "
          >
            <span>{isEn ? "Next Week" : "Tuần sau"}</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* 2. Bảng lịch công tác (Desktop Layout) */}
      <div className="hidden lg:block overflow-x-auto select-text">
        <table className="w-full text-left border-collapse border border-slate-100/60">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <th className="p-3 border-r border-slate-100 w-[15%]">{isEn ? "Day / Date" : "Thứ / Ngày"}</th>
              <th className="p-3 border-r border-slate-100 w-[8%] text-center">{isEn ? "Session" : "Buổi"}</th>
              <th className="p-3 border-r border-slate-100 w-[42%]">{isEn ? "Content / Details" : "Nội dung công việc"}</th>
              <th className="p-3 border-r border-slate-100 w-[15%]">{isEn ? "Participants" : "Thành phần"}</th>
              <th className="p-3 border-r border-slate-100 w-[10%]">{isEn ? "Chair / Host" : "Chủ trì"}</th>
              <th className="p-3 w-[10%]">{isEn ? "Location" : "Địa điểm"}</th>
            </tr>
          </thead>
          <tbody className="text-[13.5px] leading-relaxed text-slate-700">
            {schedule.days.map((day) => {
              const sessions = [
                { type: isEn ? "Morning" : "Sáng", items: day.morning },
                { type: isEn ? "Afternoon" : "Chiều", items: day.afternoon },
                { type: isEn ? "Evening" : "Tối", items: day.evening }
              ].filter(s => s.items.length > 0);

              const todayClass = isToday(day.date) 
                ? "bg-brand-darkred/[0.01] border-l-4 border-l-brand-darkred"
                : "";

              // Trường hợp ngày đó không có lịch công tác nào cả
              if (sessions.length === 0) {
                return (
                  <tr 
                    key={day.date} 
                    className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150 ${todayClass}`}
                  >
                    <td className="p-3 border-r border-slate-100 font-bold text-slate-800 align-middle">
                      <div className="flex flex-col">
                        <span>{getDayOfWeekLabel(day.dayOfWeek, day.date)}</span>
                        {isToday(day.date) && (
                          <span className="mt-1 text-[9px] w-fit font-bold uppercase tracking-wider px-1.5 py-0.5 bg-brand-darkred text-white rounded-sm">
                            {isEn ? "Today" : "Hôm nay"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 border-r border-slate-100 text-center font-medium text-slate-400 italic" colSpan={5}>
                      {isEn ? "No scheduled events" : "Không có lịch công tác"}
                    </td>
                  </tr>
                );
              }

              // Tính tổng số dòng cần gộp cho cột ngày thứ
              const totalRows = sessions.reduce((acc, s) => acc + s.items.length, 0);
              let renderedDayColumn = false;

              return sessions.map((session) => {
                return session.items.map((item, iIdx) => {
                  const isFirstRowOfDay = !renderedDayColumn;
                  renderedDayColumn = true;

                  const isFirstRowOfSession = iIdx === 0;

                  return (
                    <tr 
                      key={item.id} 
                      className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150 ${todayClass}`}
                    >
                      {/* Cột Thứ/Ngày (rowspan gộp toàn bộ dòng của ngày) */}
                      {isFirstRowOfDay && (
                        <td 
                          rowSpan={totalRows} 
                          className="p-3 border-r border-slate-100 font-bold text-slate-800 align-middle w-[15%]"
                        >
                          <div className="flex flex-col">
                            <span className={isToday(day.date) ? "text-brand-darkred font-bold" : "text-slate-800"}>
                              {getDayOfWeekLabel(day.dayOfWeek, day.date)}
                            </span>
                            {isToday(day.date) && (
                              <span className="mt-1 text-[9px] w-fit font-bold uppercase tracking-wider px-1.5 py-0.5 bg-brand-darkred text-white rounded-sm">
                                {isEn ? "Today" : "Hôm nay"}
                              </span>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Cột Buổi (rowspan gộp theo số lượng item trong buổi) */}
                      {isFirstRowOfSession && (
                        <td 
                          rowSpan={session.items.length} 
                          className="p-3 border-r border-slate-100 text-center font-bold text-slate-600 bg-slate-50/20 align-middle w-[8%]"
                        >
                          {session.type}
                        </td>
                      )}

                      {/* Nội dung chi tiết */}
                      <td className="p-3 border-r border-slate-100 font-medium text-slate-800 align-middle w-[42%]">
                        <div className="flex items-start gap-2">
                          <span className="text-slate-400 font-bold select-none text-xs bg-slate-100 px-1 py-0.5 mt-0.5 shrink-0">
                            {item.time}
                          </span>
                          <span>{isEn ? (item.contentEn || item.content) : item.content}</span>
                        </div>
                      </td>

                      {/* Thành phần */}
                      <td className="p-3 border-r border-slate-100 text-xs text-slate-600 font-medium align-middle w-[15%]">
                        {isEn ? (item.participantsEn || item.participants) : item.participants}
                      </td>

                      {/* Chủ trì */}
                      <td className="p-3 border-r border-slate-100 text-xs font-bold text-brand-darkred align-middle w-[10%]">
                        {isEn ? (item.hostEn || item.host) : item.host}
                      </td>

                      {/* Địa điểm */}
                      <td className="p-3 text-xs font-semibold text-slate-600 align-middle w-[10%]">
                        {isEn ? (item.locationEn || item.location) : item.location}
                      </td>
                    </tr>
                  );
                });
              });
            })}
          </tbody>
        </table>
      </div>

      {/* 3. Lịch trình dạng thẻ timeline (Mobile Layout) */}
      <div className="block lg:hidden space-y-6 select-text">
        {schedule.days.map((day) => {
          const sessions = [
            { type: isEn ? "Morning" : "Sáng", items: day.morning },
            { type: isEn ? "Afternoon" : "Chiều", items: day.afternoon },
            { type: isEn ? "Evening" : "Tối", items: day.evening }
          ].filter(s => s.items.length > 0);

          const todayClass = isToday(day.date) 
            ? "border-l-4 border-l-brand-darkred bg-brand-darkred/[0.01]" 
            : "border-l border-slate-100 bg-white";

          return (
            <div 
              key={day.date} 
              className={`p-4 border-y border-r border-slate-100/80  space-y-4 ${todayClass}`}
            >
              {/* Header ngày */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-sm font-bold text-slate-800">
                  {getDayOfWeekLabel(day.dayOfWeek, day.date)}
                </span>
                {isToday(day.date) && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-brand-darkred text-white rounded-sm">
                    {isEn ? "Today" : "Hôm nay"}
                  </span>
                )}
              </div>

              {/* Lịch trình các buổi */}
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  {isEn ? "No scheduled events" : "Không có lịch công tác"}
                </p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.type} className="space-y-3">
                      {/* Tiêu đề buổi */}
                      <span className="inline-block text-[10.5px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-sm">
                        {session.type}
                      </span>
                      
                      {/* Danh sách công việc */}
                      <div className="space-y-3 pl-2 border-l border-slate-100">
                        {session.items.map((item) => (
                          <div key={item.id} className="space-y-1.5 text-[13px]">
                            {/* Thời gian & Nội dung */}
                            <div className="flex items-start gap-1.5 font-bold text-slate-800 leading-snug">
                              <Clock size={13} className="text-slate-400 mt-0.5 shrink-0" />
                              <span className="text-brand-darkred">{item.time}</span>
                              <span className="mx-0.5">-</span>
                              <span>{isEn ? (item.contentEn || item.content) : item.content}</span>
                            </div>
                            
                            {/* Chi tiết thành phần, chủ trì, địa điểm */}
                            <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-600 pl-5">
                              <div className="flex items-center gap-1.5">
                                <Users size={12} className="text-slate-400" />
                                <span>{isEn ? (item.participantsEn || item.participants) : item.participants}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <User size={12} className="text-slate-400" />
                                <span className="font-bold text-brand-darkred/90">
                                  {isEn ? (item.hostEn || item.host) : item.host}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin size={12} className="text-slate-400" />
                                <span className="font-semibold">{isEn ? (item.locationEn || item.location) : item.location}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
