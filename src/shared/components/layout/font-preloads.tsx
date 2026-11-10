// Keep the original latin/vietnamese preloads; JetBrains Mono remains demand-loaded.
const fontPreloads = [
  "/fonts/inter.8db00ff46c67b22c.woff2",
  "/fonts/inter.c940764593d0fe5d.woff2",
  "/fonts/manrope.ddbf28cebf2fbbf8.woff2",
  "/fonts/manrope.8bd97e6bbbc1f602.woff2",
];

export function FontPreloads() {
  return fontPreloads.map((href) => (
    <link
      key={href}
      rel="preload"
      href={href}
      as="font"
      type="font/woff2"
      crossOrigin="anonymous"
    />
  ));
}
