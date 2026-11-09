import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { constructMetadata } from "@/shared/lib/seo";
import { ConsultationForm } from "@/features/consultation";
import { Phone, Mail, MapPin, CheckCircle, ShieldCheck } from "lucide-react";

interface ConsultationPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ConsultationPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "consultation" });

  return constructMetadata({
    title: t("metadata_title"),
    description: t("metadata_description"),
    locale,
    alternatesLanguages: {
      vi: "tu-van-tuyen-sinh",
      en: "admissions-consultation",
    },
  });
}

export default async function ConsultationPage({ params }: ConsultationPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "consultation" });

  return (
    <main className="site-container py-10 sm:py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Cột trái: Thông điệp & Lợi ích */}
        <div className="space-y-6 lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
          <div>
            <span className="text-brand-darkred bg-brand-darkred/5 border-brand-darkred/10 rounded-sm border px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
              {t("eyebrow")}
            </span>
            <h1 className="text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl leading-tight">
              {t("page_title")}
            </h1>
            <p className="text-muted-foreground mt-4 leading-relaxed text-base">
              {t("page_description")}
            </p>
          </div>

          {/* Lợi ích */}
          <div className="border-border/60 bg-section/40 space-y-4 rounded-xl border p-6">
            <div className="flex gap-4">
              <CheckCircle className="text-brand-darkred size-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-foreground text-sm font-bold">{t("benefit_questions_title")}</h3>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{t("benefit_questions_description")}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="text-brand-darkred size-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-foreground text-sm font-bold">{t("benefit_contact_title")}</h3>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{t("benefit_contact_description")}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="text-brand-darkred size-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-foreground text-sm font-bold">{t("benefit_audience_title")}</h3>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{t("benefit_audience_description")}</p>
              </div>
            </div>
          </div>

          {/* Thông tin liên hệ trực tiếp */}
          <div className="space-y-3.5 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <Phone className="text-brand-darkred size-4 shrink-0" />
              <span>Hotline Zalo: <strong>0975.373.737</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-brand-darkred size-4 shrink-0" />
              <span>Email: <strong>tuyensinh_ktcn@vinhuni.edu.vn</strong></span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="text-brand-darkred size-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">Tầng 2, Nhà A0, Trường Kỹ thuật & Công nghệ - Trường Đại học Vinh, 182 Lê Duẩn, TP. Vinh, Nghệ An</span>
            </div>
          </div>

          <p className="text-muted-foreground text-xs leading-relaxed italic border-t pt-4">
            {t("disclaimer")}
          </p>
        </div>

        {/* Cột phải: Form nhập thông tin */}
        <div className="lg:col-span-7">
          <ConsultationForm />
        </div>
      </div>
    </main>
  );
}
