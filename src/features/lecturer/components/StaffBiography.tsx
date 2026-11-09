import { StaffItem } from "../types/lecturer.types";
import { sanitizeRichHtml } from "@/shared/lib/security";

interface StaffBiographyProps {
  staff: StaffItem;
  isEn: boolean;
}

export function StaffBiography({ staff, isEn }: StaffBiographyProps) {
  return (
    <div className="space-y-10">
      {/* Biography / Academic Profile */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 relative after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-12 after:bg-brand-darkred">
          {isEn ? "Academic Profile" : "Hồ sơ chuyên môn"}
        </h2>
        
        {staff.biography ? (
          <div
            className="mt-6 text-sm sm:text-base leading-relaxed text-slate-700 rich-text-content max-w-4xl"
            dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(staff.biography) }}
          />
        ) : (
          <p className="mt-6 text-sm leading-relaxed text-slate-500 font-medium">
            {isEn
              ? "The detailed academic profile is being reviewed and will be updated by the unit."
              : "Thông tin lý lịch khoa học đang được đơn vị rà soát và cập nhật."}
          </p>
        )}
      </section>

      {/* Research Interests */}
      {staff.research_interests && (
        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 relative after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-12 after:bg-brand-darkred">
            {isEn ? "Research Interests" : "Hướng nghiên cứu"}
          </h2>
          <p className="mt-6 text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-line max-w-4xl">
            {staff.research_interests}
          </p>
        </section>
      )}
    </div>
  );
}
