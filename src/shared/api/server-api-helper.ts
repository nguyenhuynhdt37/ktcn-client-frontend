import { getLocale } from "next-intl/server";

/**
 * Trả về header Accept-Language chứa locale hiện tại ở Server-side.
 * Giúp các request fetch gửi từ Server Component có thể thông báo ngôn ngữ cần lấy cho Backend.
 */
export async function getLanguageHeader(): Promise<Record<string, string>> {
  try {
    const locale = await getLocale();
    return { "Accept-Language": locale };
  } catch {
    // Tránh lỗi khi chạy trong build-time static generation hoặc ngoài request context
    return { "Accept-Language": "vi" };
  }
}
