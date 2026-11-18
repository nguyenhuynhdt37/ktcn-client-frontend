"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Calculator, AlertCircle } from "lucide-react";

interface Major {
  code: string;
  nameVi: string;
  nameEn: string;
  benchmarkExam: number;
  benchmarkReport: number;
}

const MAJORS: Major[] = [
  { code: "7480201", nameVi: "Công nghệ Thông tin", nameEn: "Information Technology", benchmarkExam: 19.5, benchmarkReport: 22.0 },
  { code: "7520216", nameVi: "Kỹ thuật Điều khiển và Tự động hóa", nameEn: "Control & Automation Engineering", benchmarkExam: 18.0, benchmarkReport: 20.0 },
  { code: "7510205", nameVi: "Công nghệ Kỹ thuật Ô tô", nameEn: "Automotive Engineering Technology", benchmarkExam: 18.5, benchmarkReport: 21.0 },
  { code: "7520207", nameVi: "Kỹ thuật Điện tử - Viễn thông", nameEn: "Electronics & Communications Engineering", benchmarkExam: 17.5, benchmarkReport: 19.5 },
  { code: "7520103", nameVi: "Kỹ thuật Cơ khí", nameEn: "Mechanical Engineering", benchmarkExam: 16.5, benchmarkReport: 19.0 },
  { code: "7580201", nameVi: "Kỹ thuật Xây dựng", nameEn: "Civil Engineering", benchmarkExam: 16.0, benchmarkReport: 18.5 },
  { code: "7520115", nameVi: "Kỹ thuật Nhiệt", nameEn: "Thermal Engineering", benchmarkExam: 16.0, benchmarkReport: 18.0 }
];

interface SubjectGroup {
  id: string;
  subjects: string[];
  subjectsEn: string[];
}

const SUBJECT_GROUPS: SubjectGroup[] = [
  { id: "A00", subjects: ["Toán", "Vật lý", "Hóa học"], subjectsEn: ["Math", "Physics", "Chemistry"] },
  { id: "A01", subjects: ["Toán", "Vật lý", "Tiếng Anh"], subjectsEn: ["Math", "Physics", "English"] },
  { id: "B00", subjects: ["Toán", "Hóa học", "Sinh học"], subjectsEn: ["Math", "Chemistry", "Biology"] },
  { id: "D01", subjects: ["Toán", "Ngữ văn", "Tiếng Anh"], subjectsEn: ["Math", "Literature", "English"] },
  { id: "D07", subjects: ["Toán", "Hóa học", "Tiếng Anh"], subjectsEn: ["Math", "Chemistry", "English"] },
  { id: "C01", subjects: ["Toán", "Ngữ văn", "Vật lý"], subjectsEn: ["Math", "Literature", "Physics"] },
];

export function AdmissionCalculatorWidget() {
  const t = useTranslations("admission");
  const locale = useLocale();
  const isEn = locale === "en";

  const [method, setMethod] = useState<"exam" | "report">("exam");
  const [selectedGroup, setSelectedGroup] = useState<string>("A00");
  const [scores, setScores] = useState<Record<string, string>>({ sub0: "", sub1: "", sub2: "" });
  const [areaBonus, setAreaBonus] = useState<number>(0);
  const [groupBonus, setGroupBonus] = useState<number>(0);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);

  const currentGroup = SUBJECT_GROUPS.find(g => g.id === selectedGroup) || SUBJECT_GROUPS[0];
  const subjectNames = isEn ? currentGroup.subjectsEn : currentGroup.subjects;

  const resetCalculation = () => {
    setScores({ sub0: "", sub1: "", sub2: "" });
    setErrors({});
    setTotalScore(null);
    setIsCalculated(false);
  };

  const handleMethodChange = (nextMethod: "exam" | "report") => {
    setMethod(nextMethod);
    resetCalculation();
  };

  const handleGroupChange = (nextGroup: string) => {
    setSelectedGroup(nextGroup);
    resetCalculation();
  };

  const handleScoreChange = (key: string, value: string) => {
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setScores(prev => ({ ...prev, [key]: value }));
      const num = parseFloat(value);
      if (value !== "" && (isNaN(num) || num < 0 || num > 10)) {
        setErrors(prev => ({ ...prev, [key]: t("score_invalid") }));
      } else {
        setErrors(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let hasError = false;

    ["sub0", "sub1", "sub2"].forEach((key) => {
      const val = scores[key];
      if (!val) {
        newErrors[key] = isEn ? "Required" : "Trống";
        hasError = true;
      } else {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0 || num > 10) {
          newErrors[key] = t("score_invalid");
          hasError = true;
        }
      }
    });

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const s0 = parseFloat(scores.sub0);
    const s1 = parseFloat(scores.sub1);
    const s2 = parseFloat(scores.sub2);
    
    const rawSum = s0 + s1 + s2;
    const baseBonus = areaBonus + groupBonus;
    
    let actualBonus = baseBonus;
    if (rawSum >= 22.5 && method === "exam") {
      actualBonus = parseFloat((((30 - rawSum) / 7.5) * baseBonus).toFixed(2));
    }
    
    const calculatedTotal = parseFloat((rawSum + actualBonus).toFixed(2));
    setTotalScore(calculatedTotal);
    setIsCalculated(true);
  };

  return (
    <section className="py-12 bg-white border-t border-b border-slate-100" id="admission-calculator">
      <div className="max-w-[1360px] mx-auto px-6">
        
        {/* Tiêu đề phẳng */}
        <div className="flex flex-col items-start mb-8 space-y-1">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-brand-darkred shrink-0" />
            {t("calculator_title")}
          </h2>
          <p className="text-slate-600 text-xs font-normal">
            {t("calculator_subtitle")}
          </p>
        </div>

        {/* Khung chính */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* CỘT TRÁI: FORM NHẬP ĐIỂM */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-100/60 p-6 rounded-sm">
            <form onSubmit={handleCalculate} className="space-y-4">
              
              {/* 1. Chọn Phương thức xét tuyển */}
              <div className="space-y-1.5">
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t("method_label")}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleMethodChange("exam")}
                    className={`py-2 px-3 border text-center text-xs font-semibold cursor-pointer rounded-sm ${
                      method === "exam"
                        ? "border-brand-darkred bg-brand-darkred text-white"
                        : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {t("method_exam")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMethodChange("report")}
                    className={`py-2 px-3 border text-center text-xs font-semibold cursor-pointer rounded-sm ${
                      method === "report"
                        ? "border-brand-darkred bg-brand-darkred text-white"
                        : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {t("method_report")}
                  </button>
                </div>
              </div>

              {/* 2. Chọn Tổ hợp môn */}
              <div className="space-y-1.5">
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t("group_label")}
                </span>
                <div className="grid grid-cols-6 gap-1">
                  {SUBJECT_GROUPS.map((group) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => handleGroupChange(group.id)}
                      className={`py-1.5 px-1 text-center font-bold text-xs border cursor-pointer rounded-sm ${
                        selectedGroup === group.id
                          ? "bg-slate-800 border-slate-800 text-white"
                          : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {group.id}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 font-normal">
                  * Môn xét tuyển: {subjectNames.join(", ")}
                </p>
              </div>

              {/* 3. Nhập điểm các môn */}
              <div className="space-y-1.5">
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t("input_scores_label")}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {subjectNames.map((subject, index) => {
                    const key = `sub${index}`;
                    return (
                      <div key={key} className="space-y-1">
                        <label
                          htmlFor={`calc-score-${key}`}
                          className="block text-[11px] font-medium text-slate-600 truncate"
                        >
                          {subject}
                        </label>
                        <input
                          id={`calc-score-${key}`}
                          type="text"
                          inputMode="decimal"
                          value={scores[key]}
                          onChange={(e) => handleScoreChange(key, e.target.value)}
                          placeholder="0.0"
                          className={`w-full text-center py-2 px-1.5 border font-semibold text-xs bg-white focus:outline-none focus:border-brand-darkred rounded-sm ${
                            errors[key] ? "border-red-500 text-red-600" : "border-slate-100 text-slate-800"
                          }`}
                        />
                        {errors[key] && (
                          <span className="block text-[9px] text-red-500 font-medium">
                            {errors[key]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4 & 5. Ưu tiên */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label
                    htmlFor="calc-priority-area"
                    className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider"
                  >
                    {t("priority_area")}
                  </label>
                  <select
                    id="calc-priority-area"
                    value={areaBonus}
                    onChange={(e) => setAreaBonus(parseFloat(e.target.value))}
                    className="w-full py-2 px-1.5 border border-slate-100/60 bg-white focus:outline-none focus:border-brand-darkred text-xs text-slate-700 font-medium cursor-pointer rounded-sm"
                  >
                    <option value={0}>{t("area_kv3")}</option>
                    <option value={0.25}>{t("area_kv2")}</option>
                    <option value={0.5}>{t("area_kv2nt")}</option>
                    <option value={0.75}>{t("area_kv1")}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="calc-priority-group"
                    className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider"
                  >
                    {t("priority_group")}
                  </label>
                  <select
                    id="calc-priority-group"
                    value={groupBonus}
                    onChange={(e) => setGroupBonus(parseFloat(e.target.value))}
                    className="w-full py-2 px-1.5 border border-slate-100/60 bg-white focus:outline-none focus:border-brand-darkred text-xs text-slate-700 font-medium cursor-pointer rounded-sm"
                  >
                    <option value={0}>{t("group_none")}</option>
                    <option value={1.0}>{t("group_ut2")}</option>
                    <option value={2.0}>{t("group_ut1")}</option>
                  </select>
                </div>
              </div>

              {/* Nút tính điểm */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-brand-darkred hover:bg-brand-darkred-dark text-white font-bold transition-colors duration-150 text-xs cursor-pointer uppercase tracking-wider rounded-sm"
              >
                {t("calculate_btn")}
              </button>
            </form>
          </div>

          {/* CỘT PHẢI: BẢNG KẾT QUẢ PHẲNG */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Hiển thị điểm của bạn nếu đã tính */}
            {isCalculated && totalScore !== null && (
              <div className="bg-slate-50 border border-slate-100/60 p-4 flex items-center justify-between text-xs rounded-sm">
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider block">
                    {t("result_title")}
                  </span>
                  <span className="text-slate-600 font-normal">
                    {t("your_score")} {scores.sub0} + {scores.sub1} + {scores.sub2}
                    {(areaBonus > 0 || groupBonus > 0) && ` + ${(areaBonus + groupBonus).toFixed(2)} (${isEn ? "UT" : "Ưu tiên"})`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-brand-darkred">
                    {totalScore}
                  </span>
                  <span className="text-slate-600 font-semibold text-xs ml-0.5">/ 30</span>
                </div>
              </div>
            )}

            {/* Bảng các ngành đào tạo và điểm chuẩn */}
            <div className="border border-slate-100/60 bg-white overflow-hidden rounded-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-[80px]">{t("major_code")}</th>
                      <th className="py-2.5 px-3">{t("major_suggest_title")}</th>
                      <th className="py-2.5 px-3 text-center w-[90px]">{t("benchmark_2025")}</th>
                      {isCalculated && totalScore !== null && (
                        <>
                          <th className="py-2.5 px-3 text-center w-[80px]">{isEn ? "Margin" : "Lệch"}</th>
                          <th className="py-2.5 px-3 text-center w-[90px]">{isEn ? "Status" : "Kết quả"}</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {MAJORS.map((major) => {
                      const benchmark = method === "exam" ? major.benchmarkExam : major.benchmarkReport;
                      const isPassed = totalScore !== null && totalScore >= benchmark;
                      const diff = totalScore !== null ? parseFloat((totalScore - benchmark).toFixed(2)) : 0;

                      return (
                        <tr 
                          key={major.code} 
                          className={`hover:bg-slate-50/50 transition-colors duration-150 ${
                            isCalculated && totalScore !== null
                              ? isPassed 
                                ? "bg-emerald-50/10" 
                                : "bg-slate-50/10"
                              : ""
                          }`}
                        >
                          <td className="py-3 px-3 font-mono text-slate-600">{major.code}</td>
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {isEn ? major.nameEn : major.nameVi}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700">{benchmark}</td>
                          
                          {isCalculated && totalScore !== null && (
                            <>
                              <td className={`py-3 px-3 text-center font-bold ${isPassed ? "text-emerald-600" : "text-slate-600"}`}>
                                {isPassed ? `+${diff}` : `${diff}`}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`inline-block py-0.5 px-2 text-[11px] font-bold uppercase border rounded-sm ${
                                  isPassed 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                    : "bg-slate-100 text-slate-600 border-slate-100"
                                }`}>
                                  {isPassed ? t("status_pass") : t("status_fail")}
                                </span>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lưu ý chân trang phẳng */}
            <div className="p-3 bg-slate-50 border border-slate-100/60 flex items-start gap-2 rounded-sm">
              <AlertCircle className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-[10px] text-slate-600 leading-normal">
                {t("note")}
              </p>
            </div>

          </div>
          
        </div>
      </div>
    </section>
  );
}
