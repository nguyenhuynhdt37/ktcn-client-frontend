import { create } from "zustand";

interface User {
  id: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
}

/**
 * Lưu trạng thái người dùng trong bộ nhớ (in-memory).
 * Đã bỏ lưu JWT trong localStorage để tránh rủi ro XSS; phiên đăng nhập (nếu dùng) xác thực qua HttpOnly cookie.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => {
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
