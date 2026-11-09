import { PortalDepartment } from "../types/department.types";
import { sanitizeRichHtml } from "@/shared/lib/security";
import { Info } from "lucide-react";

interface DepartmentAboutProps {
  department: PortalDepartment;
  isEn: boolean;
}

export function DepartmentAbout({ department, isEn }: DepartmentAboutProps) {
  if (!department.description) return null;

  return (
    <section className="py-14 md:py-20 bg-white border-b border-slate-100">
      <div className="site-container">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-brand-blue/5 rounded-lg text-brand-blue">
              <Info className="h-5 w-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {isEn ? "About the Unit" : "Giới thiệu đơn vị"}
            </h2>
          </div>

          {/* Description Content */}
          <div 
            className="text-sm sm:text-base leading-relaxed text-slate-700 rich-text-content max-w-4xl"
            dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(department.description) }}
          />
        </div>
      </div>
    </section>
  );
}
