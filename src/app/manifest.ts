import { MetadataRoute } from "next";
import { SEO_CONFIG } from "@/shared/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh",
    short_name: "SET VinhUni",
    description: "Cổng thông tin chính thức Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: SEO_CONFIG.themeColor,
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/images/logo-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/logo-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
