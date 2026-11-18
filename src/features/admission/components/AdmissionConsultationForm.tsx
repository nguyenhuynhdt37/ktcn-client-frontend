"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Send, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export function AdmissionConsultationForm() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    department: "",
    note: "",
  });

  const isEn = pathname.startsWith("/en");

  const content = {
    title: isEn ? "Admission & Career Consultation" : "Tư vấn Tuyển sinh & Hướng nghiệp",
    subtitle: isEn 
      ? "Leave your information, our counseling team will contact you within 24 hours."
      : "Để lại thông tin của bạn, ban tư vấn tuyển sinh của Viện sẽ liên hệ hỗ trợ trong vòng 24 giờ.",
    labelName: isEn ? "Full Name *" : "Họ và tên *",
    placeholderName: isEn ? "Enter your full name" : "Nhập họ và tên của bạn",
    labelPhone: isEn ? "Phone Number / Zalo *" : "Số điện thoại / Zalo *",
    placeholderPhone: isEn ? "Enter your phone number" : "Nhập số điện thoại của bạn",
    labelEmail: isEn ? "Email Address" : "Địa chỉ Email",
    placeholderEmail: isEn ? "Enter your email (optional)" : "Nhập địa chỉ email (không bắt buộc)",
    labelDept: isEn ? "Interested Department *" : "Ngành học quan tâm *",
    selectDept: isEn ? "-- Select Department --" : "-- Chọn ngành đào tạo --",
    labelNote: isEn ? "Your Question / Message" : "Câu hỏi / Lời nhắn thêm",
    placeholderNote: isEn ? "Enter your message or questions here" : "Nhập câu hỏi hoặc nội dung bạn cần hỗ trợ thêm...",
    btnSubmit: isEn ? "Send Consultation Request" : "Gửi yêu cầu tư vấn",
    btnSending: isEn ? "Sending..." : "Đang gửi...",
    successMsg: isEn 
      ? "Registration Successful! Thank you. We will contact you soon."
      : "Đăng ký thành công! Ban tuyển sinh của Viện sẽ liên hệ lại với bạn sớm nhất.",
    errorMsg: isEn 
      ? "An error occurred. Please try again or call our hotline."
      : "Có lỗi xảy ra. Vui lòng thử lại hoặc gọi trực tiếp Hotline.",
    validationPhone: isEn ? "Invalid phone number (must be 10 digits)" : "Số điện thoại không hợp lệ (yêu cầu 10 chữ số)",
  };

  const departments = [
    { id: "cntt", name: isEn ? "Information Technology" : "Công nghệ thông tin" },
    { id: "ai", name: isEn ? "Artificial Intelligence" : "Trí tuệ nhân tạo" },
    { id: "khmt", name: isEn ? "Computer Science" : "Khoa học máy tính" },
    { id: "ktpm", name: isEn ? "Software Engineering" : "Kỹ thuật phần mềm" },
    { id: "dien", name: isEn ? "Electrical & Electronic Engineering" : "Công nghệ kỹ thuật Điện, Điện tử" },
    { id: "tdh", name: isEn ? "Control & Automation Engineering" : "Công nghệ kỹ thuật Điều khiển - Tự động hóa" },
    { id: "oto", name: isEn ? "Automotive Engineering" : "Công nghệ kỹ thuật Ô tô" },
    { id: "nhiet", name: isEn ? "Thermal Engineering" : "Kỹ thuật Nhiệt" },
  ];

  const [phoneError, setPhoneError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "phone") {
      setPhoneError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate số điện thoại Việt Nam
    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      setPhoneError(content.validationPhone);
      return;
    }

    startTransition(async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStatus("success");
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          department: "",
          note: "",
        });
      } catch {
        setStatus("error");
      }
    });
  };

  return (
    <section className="py-14 md:py-20 bg-slate-50/60 border-t border-slate-100/80">
      <div className="max-w-[1360px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Cột trái: Thông điệp và Lợi ích */}
        <div className="lg:col-span-5 space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-darkred/5 border border-brand-darkred/10 text-brand-darkred text-[11px] font-extrabold uppercase tracking-wider rounded-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tuyển sinh 2026</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-tight">
            {content.title}
          </h2>

          <p className="text-slate-600 text-sm leading-relaxed">
            {content.subtitle}
          </p>

          <div className="pt-2 space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-sm bg-brand-darkred/5 border border-brand-darkred/10 flex items-center justify-center text-brand-darkred shrink-0 mt-0.5 text-xs font-bold">
                ✓
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {isEn 
                  ? "Receive official information on admission criteria and majors" 
                  : "Nhận thông tin chính thức về phương thức xét tuyển và chỉ tiêu tuyển sinh"}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-sm bg-brand-darkred/5 border border-brand-darkred/10 flex items-center justify-center text-brand-darkred shrink-0 mt-0.5 text-xs font-bold">
                ✓
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {isEn 
                  ? "Free career path evaluation by Senior Professors" 
                  : "Đội ngũ chuyên gia, giảng viên giàu kinh nghiệm hỗ trợ hướng nghiệp 1-1"}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-sm bg-brand-darkred/5 border border-brand-darkred/10 flex items-center justify-center text-brand-darkred shrink-0 mt-0.5 text-xs font-bold">
                ✓
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {isEn 
                  ? "Explore high-paying tech jobs at VinFast, FPT, Samsung" 
                  : "Cơ hội tham gia học tập gắn liền với nhu cầu tuyển dụng thực tế của doanh nghiệp"}
              </p>
            </div>
          </div>
        </div>

        {/* Cột phải: Form nhập thông tin */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-sm relative">
          
          {status === "success" ? (
            <div className="text-center py-10 space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-sm flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{content.successMsg}</h3>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
              >
                {isEn ? "Send another request" : "Gửi yêu cầu mới"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === "error" && (
                <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-sm text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{content.errorMsg}</span>
                </div>
              )}

              {/* Grid 2 cột cho Họ tên & SĐT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                    {content.labelName}
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder={content.placeholderName}
                    className="w-full bg-white border border-slate-200 focus:border-brand-darkred focus:ring-0 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                    {content.labelPhone}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={content.placeholderPhone}
                    className={`w-full bg-white border ${phoneError ? "border-rose-500 focus:border-rose-500" : "border-slate-200 focus:border-brand-darkred"} focus:ring-0 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all outline-hidden`}
                  />
                  {phoneError && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1 uppercase tracking-wide">
                      {phoneError}
                    </p>
                  )}
                </div>
              </div>

              {/* Grid 2 cột cho Email & Ngành */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                    {content.labelEmail}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={content.placeholderEmail}
                    className="w-full bg-white border border-slate-200 focus:border-brand-darkred focus:ring-0 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="department" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                    {content.labelDept}
                  </label>
                  <select
                    id="department"
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 focus:border-brand-darkred focus:ring-0 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all outline-hidden cursor-pointer"
                  >
                    <option value="" disabled className="text-slate-400">
                      {content.selectDept}
                    </option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id} className="text-slate-800">
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lời nhắn */}
              <div className="space-y-1.5">
                <label htmlFor="note" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  {content.labelNote}
                </label>
                <textarea
                  id="note"
                  name="note"
                  rows={3}
                  value={formData.note}
                  onChange={handleChange}
                  placeholder={content.placeholderNote}
                  className="w-full bg-white border border-slate-200 focus:border-brand-darkred focus:ring-0 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all outline-hidden resize-none"
                />
              </div>

              {/* Button Submit */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-brand-darkred hover:bg-brand-darkred/90 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] cursor-pointer mt-2"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{content.btnSending}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{content.btnSubmit}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
