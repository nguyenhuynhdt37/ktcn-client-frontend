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
