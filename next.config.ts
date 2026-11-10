import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

function patternFromHost(raw: string): RemotePattern | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return {
      protocol: url.protocol.slice(0, -1) as "http" | "https",
      hostname: url.hostname,
      port: url.port,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

const localPorts = ["8000", "9000", "19000"];
const localMedia: RemotePattern[] = localPorts.flatMap((port) => [
  { protocol: "http", hostname: "localhost", port, pathname: "/**" },
  { protocol: "http", hostname: "127.0.0.1", port, pathname: "/**" },
]);

const extraMedia = (process.env.IMAGE_REMOTE_HOSTS ?? "")
  .split(",")
  .map(patternFromHost)
  .filter((pattern): pattern is RemotePattern => pattern !== null);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async headers() {
    return ["/images/:path*", "/favicon.ico"].map((source) => ({
      source,
      headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
    }));
  },
  images: {
    imageSizes: [32, 48, 64, 96, 128, 256, 320, 384, 480, 512],
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    remotePatterns: [
      ...localMedia,
      { protocol: "https", hostname: "**.itup.io.vn", pathname: "/**" },
      { protocol: "https", hostname: "**.vinhuni.edu.vn", pathname: "/**" },
      ...extraMedia,
    ],
  },
};

export default withNextIntl(nextConfig);
