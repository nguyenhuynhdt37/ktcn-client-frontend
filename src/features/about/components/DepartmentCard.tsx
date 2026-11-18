"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GraduationCap, Milestone, X, ArrowRight, Briefcase } from "lucide-react";
import type { Department } from "../types/about.types";

interface DepartmentCardProps {
  department: Department;
}

interface RoadmapYear {
  year: number;
  titleVi: string;
  titleEn: string;
  technologies: string[];
  internshipVi?: string;
  internshipEn?: string;
}

export function DepartmentCard({ department }: DepartmentCardProps) {
  const t = useTranslations("about");
  const [isOpen, setIsOpen] = useState(false);

  // Dữ liệu lộ trình công nghệ của 8 ngành (được thiết kế trực quan hóa chi tiết)
  const roadmaps: Record<string, RoadmapYear[]> = {
    cntt: [
      { year: 1, titleVi: "Đại cương & Tư duy lập trình", titleEn: "Fundamentals & Programming Logic", technologies: ["C/C++", "Git", "Linux Command"] },
      { year: 2, titleVi: "Lập trình chuyên sâu & CSDL", titleEn: "Advanced Programming & DB", technologies: ["Java", "SQL", "Python", "Data Structures"] },
      { year: 3, titleVi: "Phát triển Web/App & Cloud", titleEn: "Web/App & Cloud Development", technologies: ["React", "Node.js", "Docker", "RESTful API"] },
      { year: 4, titleVi: "Đồ án thực tế & Doanh nghiệp", titleEn: "Capstone Project & Internship", technologies: ["Microservices", "CI/CD"], internshipVi: "Thực tập tại FPT Software, TMA Solutions", internshipEn: "Internship at FPT Software, TMA Solutions" },
    ],
    ai: [
      { year: 1, titleVi: "Toán chuyên ngành & Python", titleEn: "Mathematics for AI & Python", technologies: ["Python", "Numpy", "Pandas", "Linear Algebra"] },
      { year: 2, titleVi: "Học máy & Xử lý dữ liệu lớn", titleEn: "Machine Learning & Big Data", technologies: ["Scikit-Learn", "SQL", "Data Pipelines"] },
      { year: 3, titleVi: "Học sâu & Thị giác/NLP", titleEn: "Deep Learning, CV & NLP", technologies: ["TensorFlow", "PyTorch", "OpenCV", "Transformers"] },
      { year: 4, titleVi: "Nghiên cứu ứng dụng & Lab AI", titleEn: "Applied AI Research & Capstone", technologies: ["LLMs", "MLOps"], internshipVi: "Thực tập tại VinAI, Viettel AI Lab", internshipEn: "Internship at VinAI, Viettel AI Lab" },
    ],
    khmt: [
      { year: 1, titleVi: "Toán rời rạc & OOP", titleEn: "Discrete Math & OOP", technologies: ["Java", "C++", "Algorithm Thinking"] },
      { year: 2, titleVi: "Thiết kế giải thuật & OS", titleEn: "Algorithm Design & OS", technologies: ["Linux Shell", "MySQL", "CPU Architecture"] },
      { year: 3, titleVi: "Trí tuệ nhân tạo & Cloud", titleEn: "AI Core & Cloud Computing", technologies: ["AWS", "GCP", "Python", "Parallel Computing"] },
      { year: 4, titleVi: "Nghiên cứu khoa học & Luận văn", titleEn: "Scientific Research & Thesis", technologies: ["Compiler Design"], internshipVi: "Nghiên cứu tại Viện Hàn Lâm KHCN Việt Nam", internshipEn: "Research at Vietnam Academy of Science & Technology" },
    ],
    ktpm: [
      { year: 1, titleVi: "Nhập môn KTPM & UI/UX", titleEn: "Introduction to SE & UI/UX", technologies: ["Figma", "HTML5", "CSS3", "JavaScript"] },
      { year: 2, titleVi: "Design Patterns & Kiểm thử", titleEn: "Design Patterns & Testing", technologies: ["TypeScript", "JUnit", "Jest", "Software Architecture"] },
      { year: 3, titleVi: "Quy trình Agile & DevOps", titleEn: "Agile Process & DevOps", technologies: ["GitHub Actions", "Kubernetes", "SonarQube"] },
      { year: 4, titleVi: "Thực chiến dự án doanh nghiệp", titleEn: "Industrial Project Simulation", technologies: ["Agile/Scrum", "CI/CD"], internshipVi: "Làm việc tại CMC Global, SHB Tech", internshipEn: "Work at CMC Global, SHB Tech" },
    ],
    dien: [
      { year: 1, titleVi: "Kỹ thuật điện & Vẽ CAD", titleEn: "Basic Electrical & CAD Drawing", technologies: ["AutoCAD", "MATLAB", "Circuit Theory"] },
      { year: 2, titleVi: "Điện tử & Vi điều khiển", titleEn: "Electronics & Microcontrollers", technologies: ["Arduino", "Proteus", "Embedded C"] },
      { year: 3, titleVi: "Thiết kế PCB & Hệ thống PLC", titleEn: "PCB Design & PLC Systems", technologies: ["Altium Designer", "PLC Mitsubishi", "SCADA"] },
      { year: 4, titleVi: "Nhà máy thông minh & Tốt nghiệp", titleEn: "Smart Factory & Graduation Project", technologies: ["IoT Gateway", "Industrial Sensors"], internshipVi: "Thực tập tại Meiko Electronics, Foxconn", internshipEn: "Internship at Meiko Electronics, Foxconn" },
    ],
    tdh: [
      { year: 1, titleVi: "Toán kỹ thuật & Vẽ 3D", titleEn: "Engineering Math & 3D Modeling", technologies: ["SolidWorks", "MATLAB", "Programming"] },
      { year: 2, titleVi: "Lý thuyết điều khiển & Đo lường", titleEn: "Control Theory & Measurement", technologies: ["LabVIEW", "Simulink", "Data Acquisition"] },
      { year: 3, titleVi: "PLC Nâng cao & Robot công nghiệp", titleEn: "Advanced PLC & Industrial Robotics", technologies: ["Siemens TIA Portal", "Robot ROS", "SCADA HMI"] },
      { year: 4, titleVi: "Tích hợp hệ thống tự động hóa", titleEn: "Automation System Integration", technologies: ["Industrial Networks", "DCS"], internshipVi: "Thực tập tại Nhà máy VinFast, Samsung Electronics", internshipEn: "Internship at VinFast, Samsung Electronics" },
    ],
    oto: [
      { year: 1, titleVi: "Nhập môn Ô tô & Vẽ kỹ thuật", titleEn: "Automotive Fundamentals & CAD", technologies: ["AutoCAD", "Inventor", "Engineering Mechanics"] },
      { year: 2, titleVi: "Động cơ đốt trong & Sức bền", titleEn: "ICE Theory & Strength of Materials", technologies: ["Ansys", "Matlab Simulation"] },
      { year: 3, titleVi: "Điện ô tô & Hệ thống chẩn đoán", titleEn: "Automotive Electronics & Diagnostics", technologies: ["OBD II Scanner", "ECU Tuning", "CAN Bus"] },
      { year: 4, titleVi: "Bảo dưỡng & Thiết kế xe điện", titleEn: "Maintenance & EV Design", technologies: ["Battery Systems", "Motor Controllers"], internshipVi: "Thực tập tại VinFast Factory, THACO Trường Hải", internshipEn: "Internship at VinFast Factory, THACO Trường Hải" },
    ],
    nhiet: [
      { year: 1, titleVi: "Nhiệt động học & Khí động lực", titleEn: "Thermodynamics & Fluid Dynamics", technologies: ["MATLAB", "ANSYS Fluent"] },
      { year: 2, titleVi: "Kỹ thuật lạnh & Thiết bị nhiệt", titleEn: "Refrigeration & Heat Exchangers", technologies: ["AutoCAD", "Trace 700"] },
      { year: 3, titleVi: "Hệ thống HVAC & Năng lượng sạch", titleEn: "HVAC Systems & Renewable Energy", technologies: ["Revit MEP", "Daikin VRV System"] },
      { year: 4, titleVi: "Thiết kế cơ điện MEP tòa nhà", titleEn: "MEP Building Services Design", technologies: ["HVAC Load Calculation"], internshipVi: "Thực tập tại Coteccons, Ricons, Carrier VN", internshipEn: "Internship at Coteccons, Ricons, Carrier VN" },
    ],
  };

  const currentRoadmap = roadmaps[department.id] || [];

  return (
    <>
      <div className="p-6 border border-border rounded-xl bg-white flex flex-col justify-between h-full hover:border-border-subtle hover:shadow-sm transition-all duration-200 group">
        <div className="space-y-3">
          {/* Icon */}
          <div className="w-10 h-10 flex items-center justify-center bg-brand-blue/6 text-brand-blue rounded-sm">
            {department.icon}
          </div>

          {/* Tên ngành */}
          <h4 className="text-base font-bold text-slate-800 leading-normal group-hover:text-brand-darkred transition-colors duration-200">
            {t(department.nameKey)}
          </h4>

          {/* Mã ngành */}
          <p className="text-xs text-slate-400 font-medium">
            {t("dept_code_label")}: {department.code}
          </p>

          {/* Tổ hợp xét tuyển */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {department.subjectGroups.map((group) => (
              <span
                key={group}
                className="px-2 py-0.5 text-[10px] font-bold text-brand-darkred bg-brand-darkred/5 border border-brand-darkred/10 rounded-sm"
              >
                {group}
              </span>
            ))}
          </div>
        </div>

        {/* Nút Khám phá lộ trình tương tác */}
        <button
          onClick={() => setIsOpen(true)}
          className="mt-5 w-full flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-brand-darkred/30 hover:bg-brand-darkred/5 text-slate-600 hover:text-brand-darkred font-bold text-xs rounded-sm transition-all cursor-pointer"
        >
          <Milestone className="w-3.5 h-3.5" />
          <span>{t("dept_code_label") === "Code" || t("dept_code_label") === "Mã ngành" ? "Lộ trình công nghệ" : "Technology Roadmap"}</span>
          <ArrowRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Modal lộ trình 4 năm tương tác */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg border border-border flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 flex items-center justify-center bg-brand-darkred/10 text-brand-darkred rounded-lg">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                    {t(department.nameKey)}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                    {t("dept_code_label")}: {department.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung lộ trình (Cuộn nếu quá dài) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/30">
              <div className="relative border-l border-slate-200 ml-3.5 space-y-6">
                {currentRoadmap.map((item) => (
                  <div key={item.year} className="relative pl-7 group/step">
                    {/* Điểm nút trên trục dọc */}
                    <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full border-4 border-white bg-slate-300 group-hover/step:bg-brand-darkred group-hover/step:border-brand-darkred/20 transition-all shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-600 group-hover/step:text-white" />
                    
                    <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
                      {/* Tiêu đề năm học */}
                      <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold text-brand-darkred bg-brand-darkred/5 border border-brand-darkred/10 rounded-sm mb-2">
                        {t("dept_code_label") === "Code" || t("dept_code_label") === "Mã ngành" ? `NĂM ${item.year}` : `YEAR ${item.year}`}
                      </span>

                      <h5 className="text-sm font-bold text-slate-800 leading-snug">
                        {t("dept_code_label") === "Code" || t("dept_code_label") === "Mã ngành" ? item.titleVi : item.titleEn}
                      </h5>

                      {/* Danh sách công nghệ (Chips) */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-100 rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Đối tác / Nơi thực tập (Năm 4) */}
                      {(item.internshipVi || item.internshipEn) && (
                        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-brand-darkred font-medium">
                          <Briefcase className="w-3.5 h-3.5 shrink-0 mt-0.5 text-brand-darkred/70" />
                          <span>
                            {t("dept_code_label") === "Code" || t("dept_code_label") === "Mã ngành" ? item.internshipVi : item.internshipEn}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end rounded-b-lg">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
              >
                {t("dept_code_label") === "Code" || t("dept_code_label") === "Mã ngành" ? "Đóng" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
