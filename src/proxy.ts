import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { buildCspReportOnlyHeader } from "./shared/lib/security";

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Xử lý chuyển hướng từ đường dẫn cũ /tin-tuc sang cấu trúc mới /tim-kiem và /[slug] để tương thích ngược
  const tinTucPattern = /^\/(vi|en)?\/?tin-tuc(\/.*)?$/;
  const match = pathname.match(tinTucPattern);

  if (match) {
    const locale = match[1] || "vi";
    const subPath = match[2];

    if (!subPath || subPath === "/") {
      const targetPath = locale === "en" ? "/en/search" : "/vi/tim-kiem";
      const redirectUrl = new URL(`${targetPath}${search}`, request.url);
      return NextResponse.redirect(redirectUrl, { status: 301 });
    } else {
      const slug = subPath.substring(1);
      const redirectUrl = new URL(`/${locale}/${slug}${search}`, request.url);
      return NextResponse.redirect(redirectUrl, { status: 301 });
    }
  }

  // 1. Giả lập kiểm tra Auth cho các trang admin
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Tạo nonce cho CSP Report-Only và gắn vào request headers trước khi render SSR
  const nonce = btoa(crypto.randomUUID());
  const cspReportOnly = buildCspReportOnlyHeader({ nonce });
  request.headers.set("x-nonce", nonce);
  request.headers.set("Content-Security-Policy-Report-Only", cspReportOnly);

  // 3. Chạy next-intl middleware để xử lý redirect/detect locale
  const response = intlMiddleware(request);

  // 4. Thêm các headers bảo mật
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  response.headers.set("x-nonce", nonce);
  response.headers.set("Content-Security-Policy-Report-Only", cspReportOnly);

  return response;
}

export const config = {
  matcher: [
    // Lọc các đường dẫn match i18n
    "/",
    "/(vi|en)/:path*",
    
    // Bỏ qua static assets, api, next internals, sw.js
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|manifest.json|googled15a89c91c8574e3.html|sw.js|images/.*|fonts/.*).*)",
  ],
};
