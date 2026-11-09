import { PortalDepartment } from "../types/department.types";
import { sanitizeRichHtml } from "@/shared/lib/security";
import { Compass, Target } from "lucide-react";

interface DepartmentMissionProps {
  department: PortalDepartment;
  isEn: boolean;
}

export function DepartmentMission({ department, isEn }: DepartmentMissionProps) {
  if (!department.mission && !department.vision) return null;

  return (
    <section className="py-14 md:py-20 bg-slate-50/40 border-b border-slate-100">
      <div className="site-container">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Mission Card */}
            {department.mission && (
              <div className="bg-white border border-slate-200/60 rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="p-2 bg-brand-darkred/5 rounded-lg text-brand-darkred">
                    <Target className="h-5 w-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wider">
                    {isEn ? "Mission" : "Sứ mạng"}
                  </h3>
                </div>
                <div 
                  className="text-xs sm:text-sm leading-relaxed text-slate-600 rich-text-content"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(department.mission) }}
                />
              </div>
            )}

            {/* Vision Card */}
            {department.vision && (
              <div className="bg-white border border-slate-200/60 rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="p-2 bg-brand-blue/5 rounded-lg text-brand-blue">
                    <Compass className="h-5 w-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wider">
                    {isEn ? "Vision" : "Tầm nhìn"}
                  </h3>
                </div>
                <div 
                  className="text-xs sm:text-sm leading-relaxed text-slate-600 rich-text-content"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(department.vision) }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
