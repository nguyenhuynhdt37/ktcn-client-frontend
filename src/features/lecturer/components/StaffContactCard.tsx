import { StaffItem } from "../types/lecturer.types";
import { safePortalHref } from "@/shared/lib/security";
import { Mail, Phone, MapPin, Globe, ExternalLink } from "lucide-react";

interface StaffContactCardProps {
  staff: StaffItem;
  isEn: boolean;
}

export function StaffContactCard({ staff, isEn }: StaffContactCardProps) {
  const safeWebsite = staff.website ? safePortalHref(staff.website, "") : "";
  const contactItems = [
    staff.email
      ? { icon: Mail, label: "Email", value: staff.email, href: `mailto:${staff.email}` }
      : null,
    staff.phone
      ? {
          icon: Phone,
          label: isEn ? "Phone" : "Điện thoại",
          value: staff.phone,
          href: `tel:${staff.phone}`,
        }
      : null,
    staff.office
      ? { icon: MapPin, label: isEn ? "Office" : "Văn phòng", value: staff.office }
      : null,
    safeWebsite && safeWebsite !== "#"
      ? { icon: Globe, label: "Website", value: staff.website!, href: safeWebsite }
      : null,
  ].filter(Boolean) as Array<{ icon: typeof Mail; label: string; value: string; href?: string }>;

  return (
    <aside className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
        {isEn ? "Contact Information" : "Thông tin liên hệ"}
      </h2>

      {contactItems.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {contactItems.map((item, i) => {
            const content = (
              <div className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <div className="p-2.5 bg-brand-darkred/5 rounded-xl text-brand-darkred shrink-0">
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {item.label}
                  </div>
                  <div className="mt-1 break-all text-sm font-semibold text-slate-800">
                    {item.value}
                  </div>
                </div>
              </div>
            );

            return item.href ? (
              <a
                key={i}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="block hover:bg-slate-50 rounded-xl -mx-2 px-2 transition-colors duration-200"
              >
                {content}
              </a>
            ) : (
              <div key={i}>{content}</div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-slate-500 font-medium">
          {isEn ? "Contact details are being updated." : "Thông tin liên hệ đang được cập nhật."}
        </p>
      )}

      {safeWebsite && safeWebsite !== "#" && (
        <a
          href={safeWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-darkred hover:bg-brand-darkred-dark px-4 text-sm font-bold text-white transition-colors duration-200 shadow-sm hover:shadow-md cursor-pointer"
        >
          <span>{isEn ? "Open Website" : "Mở website"}</span>
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
    </aside>
  );
}
