import axios from "axios";
import { env } from "../config/env";

export const axiosClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Lấy ngôn ngữ hiện tại của client từ URL, cookie hoặc localStorage
function getClientLocale(): string {
  if (typeof window === "undefined") return "vi";

  // 1. Lấy từ URL path segment đầu tiên (ví dụ /vi/tin-tuc -> vi)
  const pathname = window.location.pathname;
  const segments = pathname.split("/");
  if (segments[1] === "vi" || segments[1] === "en") {
    return segments[1];
  }

  // 2. Lấy từ Cookie 'locale'
  const localeMatch = document.cookie.match(/(^|;)\s*locale\s*=\s*([^;]+)/);
  if (localeMatch) return localeMatch[2];

  // 3. Lấy từ Cookie 'NEXT_LOCALE'
  const nextLocaleMatch = document.cookie.match(/(^|;)\s*NEXT_LOCALE\s*=\s*([^;]+)/);
  if (nextLocaleMatch) return nextLocaleMatch[2];

  // 4. Lấy từ localStorage 'lang'
  const localLang = localStorage.getItem("lang");
  if (localLang) return localLang;

  return "vi";
}

// Interceptor xử lý Request (xác thực phiên nếu có qua HttpOnly cookie với withCredentials: true, không đọc JWT từ localStorage)
axiosClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Đính kèm ngôn ngữ hiện tại vào Accept-Language header
      config.headers["Accept-Language"] = getClientLocale();
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor xử lý Response
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý các mã lỗi hệ thống tập trung
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        console.warn("Unauthorized access - Redirecting or clearing session...");
        // Xử lý logout hoặc refresh token ở client-side
      } else if (status === 403) {
        console.error("Forbidden - No permission to access this resource");
      }
    }
    return Promise.reject(error);
  }
);
