import sanitizeHtml from "sanitize-html";

/** Sanitize at every raw HTML rendering boundary, including previews and SSR. */
export function sanitizeRichHtml(value: string | null | undefined): string {
  return sanitizeHtml(value ?? "", {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "iframe", "video", "audio", "source"],
    allowedAttributes: {
      "*": ["id", "class", "title", "style"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      iframe: ["src", "width", "height", "allowfullscreen", "title"],
      video: ["src", "controls", "poster", "width", "height"],
      audio: ["src", "controls"],
      source: ["src", "type"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan", "scope"],
      col: ["span", "width"],
    },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    allowProtocolRelative: false,
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
    allowedStyles: {
      "*": {
        "text-align": [/^(left|right|center|justify)$/],
        color: [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i, /^[a-z]+$/i],
        "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i, /^[a-z]+$/i],
        "font-size": [/^\d+(\.\d+)?(px|pt|em|rem|%)$/],
        "font-weight": [/^(normal|bold|[1-9]00)$/],
        "font-style": [/^(normal|italic)$/],
        "text-decoration": [/^(none|underline|line-through)$/],
        width: [/^\d+(\.\d+)?(px|pt|em|rem|%)$/],
        height: [/^\d+(\.\d+)?(px|pt|em|rem|%)$/],
      },
    },
    nestingLimit: 100,
  });
}

/** HTML's script parser recognizes closing tags even inside JSON strings. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/** Only allow safe relative paths or http(s)/mailto/tel URLs in href attributes. */
export function safePortalHref(value?: string | null, fallback = "#"): string {
  const href = (value ?? "").trim();
  if (!href || /[\u0000-\u001f\u007f\\]/.test(href)) return fallback;
  if (href.startsWith("#")) return href;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const url = new URL(href);
    return ["https:", "http:", "mailto:", "tel:"].includes(url.protocol) ? href : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Build a Content-Security-Policy-Report-Only header value.
 * Uses a per-request nonce when provided by proxy.ts, or falls back to source allowlists for static routes.
 */
export function buildCspReportOnlyHeader(options?: {
  nonce?: string;
  isDev?: boolean;
  apiOrigin?: string;
}): string {
  const nonce = options?.nonce?.trim();
  const isDev = options?.isDev ?? process.env.NODE_ENV === "development";
  const rawApiUrl = options?.apiOrigin ?? process.env.NEXT_PUBLIC_API_URL ?? "";
  let apiOrigin = "";
  if (rawApiUrl) {
    try {
      apiOrigin = new URL(rawApiUrl).origin;
    } catch {
      apiOrigin = "";
    }
  }

  const scriptSources = [
    "'self'",
    nonce ? `'nonce-${nonce}'` : "'unsafe-inline'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    ...(isDev ? ["'unsafe-eval'"] : []),
  ].join(" ");

  const connectSources = Array.from(
    new Set([
      "'self'",
      "https://*.vinhuni.edu.vn",
      "https://*.itup.io.vn",
      "https://www.google-analytics.com",
      "https://region1.google-analytics.com",
      "https://www.googletagmanager.com",
      ...(apiOrigin && apiOrigin !== "null" ? [apiOrigin] : []),
      ...(isDev
        ? ["http://localhost:*", "http://127.0.0.1:*", "ws://localhost:*", "ws://127.0.0.1:*"]
        : []),
    ]),
  ).join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSources}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' data:",
    `connect-src ${connectSources}`,
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com",
    "media-src 'self' data: blob: https: http:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}
