import type { ChatLang } from "../types";

export const GREETING: Record<ChatLang, string> = {
  vi: "Xin chào! Mình là trợ lý ảo của Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh. Bạn muốn tìm hiểu điều gì?",
  en: "Hello! I'm the virtual assistant of the College of Engineering and Technology - Vinh University. What would you like to know?",
};

export interface SuggestionGroup {
  group: string;
  questions: string[];
}

export const SUGGESTIONS: Record<ChatLang, SuggestionGroup[]> = {
  vi: [
    { group: "Giới thiệu", questions: ["Trường Kỹ thuật và Công nghệ có những khoa nào?", "Trường được thành lập khi nào?"] },
    { group: "Đào tạo", questions: ["Trường đào tạo những ngành nào?", "Chương trình Công nghệ thông tin học mấy năm?", "Có chương trình thạc sĩ không?"] },
    { group: "Cán bộ", questions: ["Ban lãnh đạo Trường gồm những ai?", "Khoa Tự động hóa có những giảng viên nào?"] },
    { group: "Tuyển sinh", questions: ["Thông tin tuyển sinh của trường?", "Làm sao để đăng ký tư vấn tuyển sinh?"] },
    { group: "Liên hệ", questions: ["Trường ở đâu, liên hệ bằng số điện thoại nào?", "Tin tức mới nhất của trường?"] },
  ],
  en: [
    { group: "About", questions: ["Which faculties does the College have?", "When was the College founded?"] },
    { group: "Programs", questions: ["Which programs does the College offer?", "How many years is the Information Technology program?", "Is there a master's program?"] },
    { group: "Staff", questions: ["Who is on the College's leadership board?", "Which lecturers are in the Faculty of Automation?"] },
    { group: "Admissions", questions: ["What is the College's admission information?", "How can I register for admissions advice?"] },
    { group: "Contact", questions: ["Where is the College and how can I call?", "What is the latest news from the College?"] },
  ],
};

export const UI_TEXT: Record<ChatLang, Record<string, string>> = {
  vi: {
    open: "Mở trợ lý ảo",
    close: "Đóng",
    expand: "Phóng to",
    shrink: "Thu nhỏ",
    drag: "Kéo để di chuyển",
    title: "Trợ lý ảo",
    subtitle: "Trường Kỹ thuật và Công nghệ",
    placeholder: "Nhập câu hỏi của bạn…",
    send: "Gửi",
    thinking: "Đang trả lời…",
    network: "Không kết nối được tới trợ lý. Vui lòng thử lại.",
    rate: "Bạn gửi hơi nhanh. Vui lòng đợi một chút rồi thử lại.",
    sources: "Nguồn",
    more: "Bạn có thể hỏi thêm",
  },
  en: {
    open: "Open virtual assistant",
    close: "Close",
    expand: "Enlarge",
    shrink: "Shrink",
    drag: "Drag to move",
    title: "Virtual assistant",
    subtitle: "College of Engineering and Technology",
    placeholder: "Type your question…",
    send: "Send",
    thinking: "Typing…",
    network: "Couldn't reach the assistant. Please try again.",
    rate: "You're sending messages too fast. Please wait a moment.",
    sources: "Sources",
    more: "You can also ask",
  },
};
