import { WeekSchedule, DaySchedule, CalendarSessionItem } from "../types/calendar.types";

// Hàm tiện ích cộng/trừ ngày
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Định dạng Date sang YYYY-MM-DD
export function formatDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Tìm thứ Hai gần nhất trước hoặc bằng ngày hiện tại
export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // 0 là Chủ Nhật
  return new Date(date.setDate(diff));
}

export function getMockWeekSchedule(mondayStr?: string): WeekSchedule {
  let monday: Date;
  if (mondayStr) {
    monday = new Date(mondayStr);
    if (isNaN(monday.getTime())) {
      monday = getMonday(new Date());
    }
  } else {
    monday = getMonday(new Date());
  }

  // Đảm bảo đúng thứ 2
  monday = getMonday(monday);

  const days: DaySchedule[] = [];
  const dayNamesVi = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

  // Tạo lịch trình cho 7 ngày từ Thứ Hai đến Chủ Nhật
  for (let i = 0; i < 7; i++) {
    const currentDayDate = addDays(monday, i);
    const dayOfWeek = i + 2; // 2 = Thứ Hai, ..., 8 = Chủ Nhật
    const dateStr = formatDateString(currentDayDate);

    const morning: CalendarSessionItem[] = [];
    const afternoon: CalendarSessionItem[] = [];
    const evening: CalendarSessionItem[] = [];

    // Tạo lịch giả định ngẫu nhiên tùy theo thứ tự ngày trong tuần
    if (i === 0) { // Thứ Hai
      morning.push({
        id: `m1-${dateStr}`,
        time: "08:00",
        content: "Họp giao ban Lãnh đạo Viện / Trường Kỹ thuật & Công nghệ tuần mới",
        contentEn: "Weekly briefing of the Board of Management - College of Engineering & Technology",
        host: "TS. Đặng Thái Sơn",
        hostEn: "Dr. Dang Thai Son",
        location: "P.201 Nhà A3",
        locationEn: "Room 201, Building A3",
        participants: "Ban Giám đốc, các Trợ lý Viện, Trưởng các Bộ môn",
        participantsEn: "Board of Management, Directors Assistants, Heads of Departments"
      });
      afternoon.push({
        id: `a1-${dateStr}`,
        time: "14:00",
        content: "Gặp mặt và phổ biến quy chế cho tân học viên Cao học khóa mới",
        contentEn: "Meeting and orientation session for new Master students",
        host: "TS. Lê Văn Minh",
        hostEn: "Dr. Le Van Minh",
        location: "Phòng Seminar A5",
        locationEn: "Seminar Room, Building A5",
        participants: "Đại diện Lãnh đạo Viện, Trợ lý Đào tạo SĐH, các học viên cao học mới",
        participantsEn: "Institute Directors, Postgrad Assistant, new Master students"
      });
    } else if (i === 1) { // Thứ Ba
      morning.push({
        id: `m2-${dateStr}`,
        time: "09:00",
        content: "Làm việc với Đoàn chuyên gia khảo sát phục vụ kiểm định chương trình đào tạo",
        contentEn: "Working session with accreditation experts for curriculum evaluation",
        host: "TS. Đặng Thái Sơn",
        hostEn: "Dr. Dang Thai Son",
        location: "Phòng họp hội đồng Nhà A5",
        locationEn: "Council Meeting Room, Building A5",
        participants: "Ban Lãnh đạo Viện, Hội đồng Tự đánh giá ngành CNTT & Kỹ thuật",
        participantsEn: "Institute Board, Self-Assessment Committee of IT & Engineering"
      });
      afternoon.push({
        id: `a2-${dateStr}`,
        time: "14:30",
        content: "Hội thảo học thuật: Ứng dụng Học sâu và Computer Vision trong nông nghiệp thông minh",
        contentEn: "Academic Seminar: Deep Learning and Computer Vision in Smart Agriculture",
        host: "PGS.TS. Hoàng Hữu Việt",
        hostEn: "Assoc. Prof. Dr. Hoang Huu Viet",
        location: "Hội trường B5",
        locationEn: "Hall B5",
        participants: "Toàn bộ giảng viên và học viên cao học, sinh viên nghiên cứu khoa học",
        participantsEn: "All lecturers, Master/PhD students, and student researchers"
      });
    } else if (i === 2) { // Thứ Tư
      morning.push({
        id: `m3-${dateStr}`,
        time: "08:30",
        content: "Ký kết thỏa thuận hợp tác đào tạo và tuyển dụng (MOU) với doanh nghiệp công nghệ",
        contentEn: "MOU signing ceremony for training and recruitment partnership with tech companies",
        host: "TS. Đặng Thái Sơn",
        hostEn: "Dr. Dang Thai Son",
        location: "Hội trường Lớn Trường Đại học Vinh",
        locationEn: "Main Hall, Vinh University",
        participants: "Lãnh đạo Viện, Trợ lý đối ngoại, giảng viên, và đại diện các doanh nghiệp",
        participantsEn: "Board of Management, External Relations Assistant, lecturers, and corporate reps"
      });
    } else if (i === 3) { // Thứ Năm
      morning.push({
        id: `m4-${dateStr}`,
        time: "08:00",
        content: "Hội đồng đánh giá và nghiệm thu đề tài Nghiên cứu khoa học cấp cơ sở năm 2026",
        contentEn: "Evaluation and defense council for institutional research projects in 2026",
        host: "PGS.TS. Hoàng Hữu Việt",
        hostEn: "Assoc. Prof. Dr. Hoang Huu Viet",
        location: "Phòng họp 2 Nhà A5",
        locationEn: "Meeting Room 2, Building A5",
        participants: "Thành viên Hội đồng khoa học, các chủ nhiệm đề tài",
        participantsEn: "Science Council members, project principal investigators"
      });
      afternoon.push({
        id: `a4-${dateStr}`,
        time: "15:00",
        content: "Sinh hoạt chuyên môn định kỳ và rà soát giáo trình bài giảng học kỳ II",
        contentEn: "Routine department meeting and review of course syllabus for Semester II",
        host: "Trưởng các Bộ môn",
        hostEn: "Heads of Departments",
        location: "Văn phòng các Bộ môn tương ứng",
        locationEn: "Respective Department Offices",
        participants: "Toàn thể giảng viên các bộ môn (CNTT, Điện - Điện tử, Ô tô, Cơ khí)",
        participantsEn: "All lecturers of respective departments (IT, Electrical, Automotive, Mechanical)"
      });
    } else if (i === 4) { // Thứ Sáu
      morning.push({
        id: `m5-${dateStr}`,
        time: "09:00",
        content: "Dự lễ tổng kết chiến dịch tình nguyện Mùa hè xanh năm 2026",
        contentEn: "Attending the closing ceremony of the Green Summer volunteer campaign 2026",
        host: "Đại diện Lãnh đạo Viện",
        hostEn: "Representative of Institute Board",
        location: "Hội trường B Trường Đại học Vinh",
        locationEn: "Vinh University Hall B",
        participants: "Liên chi đoàn, Liên chi hội sinh viên, các đội hình tình nguyện",
        participantsEn: "Youth Union assistants, volunteer teams, student union representatives"
      });
      afternoon.push({
        id: `a5-${dateStr}`,
        time: "14:00",
        content: "Đại hội Đại biểu Đoàn TNCS Hồ Chí Minh Trường Kỹ thuật và Công nghệ nhiệm kỳ mới",
        contentEn: "Youth Union Delegate Congress of the College of Engineering and Technology",
        host: "Ban thường vụ Đoàn Viện",
        hostEn: "Executive Committee of Youth Union",
        location: "Hội trường Lớn Trường Đại học Vinh",
        locationEn: "Main Hall, Vinh University",
        participants: "Ban Lãnh đạo Viện, đại diện Đoàn Trường ĐH Vinh, các đại biểu triệu tập",
        participantsEn: "Institute Board, Vinh Uni Youth Union reps, and summoned student delegates"
      });
    } else if (i === 5) { // Thứ Bảy
      morning.push({
        id: `m6-${dateStr}`,
        time: "08:30",
        content: "Tập huấn phương pháp nghiên cứu khoa học và viết bài báo quốc tế Scopus/SCIE",
        contentEn: "Training workshop on scientific research methods and publishing in Scopus/SCIE journals",
        host: "PGS.TS. Hoàng Hữu Việt",
        hostEn: "Assoc. Prof. Dr. Hoang Huu Viet",
        location: "Phòng Hội thảo thông minh A5",
        locationEn: "Smart Seminar Room, Building A5",
        participants: "Giảng viên trẻ, học viên cao học, nghiên cứu sinh và sinh viên tài năng",
        participantsEn: "Young lecturers, Master/PhD students, and honor undergraduate students"
      });
    }
    // Chủ Nhật nghỉ, không push lịch

    days.push({
      date: dateStr,
      dayOfWeek: dayOfWeek,
      morning,
      afternoon,
      evening
    });
  }

  // Ngày kết thúc tuần (Chủ Nhật)
  const sunday = addDays(monday, 6);

  return {
    weekStartDate: formatDateString(monday),
    weekEndDate: formatDateString(sunday),
    days
  };
}
