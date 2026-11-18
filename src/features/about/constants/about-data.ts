// src/features/about/constants/about-data.ts
import {
  GraduationCap,
  School,
  Rocket,
  BookOpen,
  Cpu,
  Monitor,
  Zap,
  Car,
  Thermometer,
  BrainCircuit,
  Code,
  Target,
  Eye,
  Star,
  Users,
  CalendarDays,
  Award,
  Wifi,
  Library,
  Building2,
  Globe,
  FlaskConical,
  Trophy,
  FileCheck,
  Newspaper,
} from "lucide-react";
import { createElement } from "react";

import type {
  TimelineEvent,
  MissionItem,
  Department,
  StatItem,
  FacilityItem,
  AchievementItem,
  ContactInfo,
  LeaderProfile,
  PartnerItem,
  PressItem,
} from "../types/about.types";

// ─── Timeline ──────────────────────────────────────────────
export const ABOUT_TIMELINE: TimelineEvent[] = [
  {
    id: "1",
    year: "2002",
    title: "timeline_2002_title",
    description: "timeline_2002_desc",
    icon: createElement(GraduationCap, { className: "w-4 h-4" }),
  },
  {
    id: "2",
    year: "2007",
    title: "timeline_2007_title",
    description: "timeline_2007_desc",
    icon: createElement(BookOpen, { className: "w-4 h-4" }),
  },
  {
    id: "3",
    year: "2013",
    title: "timeline_2013_title",
    description: "timeline_2013_desc",
    icon: createElement(FlaskConical, { className: "w-4 h-4" }),
  },
  {
    id: "4",
    year: "2017",
    title: "timeline_2017_title",
    description: "timeline_2017_desc",
    icon: createElement(School, { className: "w-4 h-4" }),
  },
  {
    id: "5",
    year: "2023",
    title: "timeline_2023_title",
    description: "timeline_2023_desc",
    icon: createElement(FileCheck, { className: "w-4 h-4" }),
  },
  {
    id: "6",
    year: "2026",
    title: "timeline_2026_title",
    description: "timeline_2026_desc",
    icon: createElement(Rocket, { className: "w-4 h-4" }),
  },
];

// ─── Mission / Vision / Core Values ───────────────────────
export const MISSION_ITEMS: MissionItem[] = [
  {
    id: "mission",
    titleKey: "mission_title",
    descriptionKey: "mission_desc",
    icon: createElement(Target, { className: "w-6 h-6" }),
  },
  {
    id: "vision",
    titleKey: "vision_title",
    descriptionKey: "vision_desc",
    icon: createElement(Eye, { className: "w-6 h-6" }),
  },
  {
    id: "values",
    titleKey: "values_title",
    descriptionKey: "values_desc",
    icon: createElement(Star, { className: "w-6 h-6" }),
  },
];

// ─── Departments ──────────────────────────────────────────
export const DEPARTMENTS: Department[] = [
  {
    id: "cntt",
    nameKey: "dept_cntt",
    code: "7480201",
    subjectGroups: ["A00", "A01", "D01"],
    icon: createElement(Monitor, { className: "w-5 h-5" }),
  },
  {
    id: "ai",
    nameKey: "dept_ai",
    code: "7480201_AI",
    subjectGroups: ["A00", "A01", "D01"],
    icon: createElement(BrainCircuit, { className: "w-5 h-5" }),
  },
  {
    id: "khmt",
    nameKey: "dept_khmt",
    code: "7480101",
    subjectGroups: ["A00", "A01", "D01"],
    icon: createElement(Cpu, { className: "w-5 h-5" }),
  },
  {
    id: "ktpm",
    nameKey: "dept_ktpm",
    code: "7480103",
    subjectGroups: ["A00", "A01", "D01"],
    icon: createElement(Code, { className: "w-5 h-5" }),
  },
  {
    id: "dien",
    nameKey: "dept_dien",
    code: "7510301",
    subjectGroups: ["A00", "A01", "B00"],
    icon: createElement(Zap, { className: "w-5 h-5" }),
  },
  {
    id: "tdh",
    nameKey: "dept_tdh",
    code: "7510303",
    subjectGroups: ["A00", "A01", "B00"],
    icon: createElement(Cpu, { className: "w-5 h-5" }),
  },
  {
    id: "oto",
    nameKey: "dept_oto",
    code: "7510205",
    subjectGroups: ["A00", "A01", "B00"],
    icon: createElement(Car, { className: "w-5 h-5" }),
  },
  {
    id: "nhiet",
    nameKey: "dept_nhiet",
    code: "7520115",
    subjectGroups: ["A00", "A01", "B00"],
    icon: createElement(Thermometer, { className: "w-5 h-5" }),
  },
];

// ─── Leaders ──────────────────────────────────────────────
export const LEADERS: LeaderProfile[] = [
  {
    id: "1",
    nameKey: "leader_1_name",
    titleKey: "leader_1_title",
    positionKey: "leader_1_position",
    imageUrl: "/images/no-image-dhv.jpg",
    specialtyKey: "leader_1_specialty",
  },
  {
    id: "2",
    nameKey: "leader_2_name",
    titleKey: "leader_2_title",
    positionKey: "leader_2_position",
    imageUrl: "/images/no-image-dhv.jpg",
    specialtyKey: "leader_2_specialty",
  },
  {
    id: "3",
    nameKey: "leader_3_name",
    titleKey: "leader_3_title",
    positionKey: "leader_3_position",
    imageUrl: "/images/no-image-dhv.jpg",
    specialtyKey: "leader_3_specialty",
  },
];

// ─── Stats ────────────────────────────────────────────────
export const STATS: StatItem[] = [
  {
    id: "years",
    value: 20,
    suffix: "+",
    labelKey: "stat_years",
    icon: createElement(CalendarDays, { className: "w-5 h-5" }),
  },
  {
    id: "programs",
    value: 8,
    suffix: "",
    labelKey: "stat_programs",
    icon: createElement(BookOpen, { className: "w-5 h-5" }),
  },
  {
    id: "faculty",
    value: 80,
    suffix: "+",
    labelKey: "stat_faculty",
    icon: createElement(Users, { className: "w-5 h-5" }),
  },
  {
    id: "students",
    value: 3000,
    suffix: "+",
    labelKey: "stat_students",
    icon: createElement(GraduationCap, { className: "w-5 h-5" }),
  },
];

// ─── Facilities ───────────────────────────────────────────
export const FACILITIES: FacilityItem[] = [
  {
    id: "lab",
    titleKey: "facility_lab_title",
    descriptionKey: "facility_lab_desc",
    icon: createElement(FlaskConical, { className: "w-5 h-5" }),
  },
  {
    id: "wifi",
    titleKey: "facility_wifi_title",
    descriptionKey: "facility_wifi_desc",
    icon: createElement(Wifi, { className: "w-5 h-5" }),
  },
  {
    id: "library",
    titleKey: "facility_library_title",
    descriptionKey: "facility_library_desc",
    icon: createElement(Library, { className: "w-5 h-5" }),
  },
  {
    id: "digital",
    titleKey: "facility_digital_title",
    descriptionKey: "facility_digital_desc",
    icon: createElement(Building2, { className: "w-5 h-5" }),
  },
];

// ─── Partners ─────────────────────────────────────────────
export const PARTNERS: PartnerItem[] = [
  {
    id: "1",
    name: "Đại học Waikato",
    country: "New Zealand",
    imageUrl: "/images/partners/waikato.png",
    proofUrl: "https://baonghean.vn/truong-dai-hoc-vinh-trao-doi-thoa-thuan-hop-tac-voi-dai-hoc-waikato-new-zealand-10269455.html",
  },
  {
    id: "2",
    name: "Đại học Quốc gia Jeonbuk",
    country: "Hàn Quốc",
    imageUrl: "/images/partners/jeonbuk.png",
    proofUrl: "https://baonghean.vn/truong-dai-hoc-vinh-khoi-dong-du-an-oda-tri-gia-hon-2-7-ty-won-do-chinh-phu-han-quoc-tai-tro-10259827.html",
  },
  {
    id: "3",
    name: "Đại học Quốc gia Lào",
    country: "Lào",
    imageUrl: "/images/partners/laos.png",
    proofUrl: "https://baonghean.vn/sinh-vien-tinh-nguyen-truong-dai-hoc-vinh-tren-dat-nuoc-trieu-voi-post256345.html",
  },
  {
    id: "4",
    name: "Đại học Quốc gia Voronezh",
    country: "Liên bang Nga",
    imageUrl: "/images/partners/voronezh.png",
    proofUrl: "https://baonghean.vn/thuc-day-hop-tac-giua-cac-truong-dai-hoc-viet-nam-va-lien-bang-nga-post287895.html",
  },
  {
    id: "5",
    name: "Đại học Zielona Gora",
    country: "Ba Lan",
    imageUrl: "/images/partners/zielona_gora.png",
    proofUrl: "https://baonghean.vn/truong-dai-hoc-vinh-day-manh-hop-tac-quoc-te-post283307.html",
  },
  {
    id: "6",
    name: "Đại học Victoria",
    country: "Australia",
    imageUrl: "/images/partners/victoria.png",
    proofUrl: "https://baonghean.vn/dai-hoc-vinh-va-cac-doi-tac-australia-post264103.html",
  },
];

// ─── Achievements ─────────────────────────────────────────
export const ACHIEVEMENTS: AchievementItem[] = [
  {
    id: "1",
    titleKey: "achievement_1_title",
    descriptionKey: "achievement_1_desc",
    icon: createElement(Award, { className: "w-5 h-5" }),
  },
  {
    id: "2",
    titleKey: "achievement_2_title",
    descriptionKey: "achievement_2_desc",
    icon: createElement(Newspaper, { className: "w-5 h-5" }),
  },
  {
    id: "3",
    titleKey: "achievement_3_title",
    descriptionKey: "achievement_3_desc",
    icon: createElement(Trophy, { className: "w-5 h-5" }),
  },
  {
    id: "4",
    titleKey: "achievement_4_title",
    descriptionKey: "achievement_4_desc",
    icon: createElement(Users, { className: "w-5 h-5" }),
  },
  {
    id: "5",
    titleKey: "achievement_5_title",
    descriptionKey: "achievement_5_desc",
    icon: createElement(Globe, { className: "w-5 h-5" }),
  },
];

// ─── Contact ──────────────────────────────────────────────
export const CONTACT_INFO: ContactInfo = {
  address: "182 Lê Duẩn, Thành phố Vinh, Nghệ An",
  phone: "(0238) 3855 452",
  email: "vienktcn@vinhuni.edu.vn",
  website: "https://ktcn.vinhuni.edu.vn",
  facebookUrl: "https://www.facebook.com/Vienktcn",
};

// ─── Press Items ──────────────────────────────────────────
export const PRESS_ITEMS: PressItem[] = [
  {
    id: "press_1",
    titleKey: "press_1_title",
    publisher: "Báo Nghệ An",
    url: "https://baonghean.vn/truong-dai-hoc-vinh-trao-doi-thoa-thuan-hop-tac-voi-dai-hoc-waikato-new-zealand-post286088.html",
  },
  {
    id: "press_2",
    titleKey: "press_2_title",
    publisher: "Báo Nghệ An",
    url: "https://baonghean.vn/truong-dai-hoc-vinh-khoi-dong-du-an-oda-tri-gia-hon-2-7-ty-won-post276180.html",
  },
  {
    id: "press_3",
    titleKey: "press_3_title",
    publisher: "Báo Nghệ An",
    url: "https://baonghean.vn/ky-vong-vao-su-doi-moi-phat-trien-cua-truong-dai-hoc-vinh-trong-nhiem-ky-2025-2030-post299387.html",
  },
  {
    id: "press_4",
    titleKey: "press_4_title",
    publisher: "Báo Giáo dục & Thời đại",
    url: "https://giaoducthoidai.vn/fpt-education-hop-tac-voi-truong-dai-hoc-vinh-phat-trien-viec-lam-cho-sinh-vien-post652718.html",
  },
  {
    id: "press_5",
    titleKey: "press_5_title",
    publisher: "Báo Nghệ An",
    url: "https://baonghean.vn/learn-to-leap-ky-ket-hop-tac-cung-dai-hoc-vinh-va-xa-tam-thai-hien-thuc-hoa-tam-nhin-dua-giao-duc-stem-ai-den-moi-mien-to-quoc-post295678.html",
  },
];

