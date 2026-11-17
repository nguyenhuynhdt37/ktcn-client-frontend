import NextLink from "next/link";
import type { ComponentProps } from "react";
import { getPathname } from "@/i18n/routing";
import { safePortalHref } from "../utils/links";

export function localizedPortalHref(raw: string, locale: string): string {
  const href = safePortalHref(raw);
  if (!href.startsWith("/")) return href;
  if (/^\/(vi|en)(\/|$)/.test(href)) return href;
  const url = new URL(href, "https://portal.local");
  const language = locale === "en" ? "en" : "vi";
  const routes = [
    "/tin-tuc",
    "/khoa",
    "/bo-mon",
    "/nhan-su",
    "/dao-tao/dai-hoc",
    "/dao-tao/sau-dai-hoc",
    "/lich-tuan",
  ] as const;
  for (const route of routes) {
    const prefix = `${route}/`;
    if (url.pathname.startsWith(prefix) && !url.pathname.slice(prefix.length).includes("/")) {
      return (
        getPathname({
          locale: language,
          href: {
            pathname: `${route}/[slug]`,
            params: { slug: url.pathname.slice(prefix.length) },
          },
        }) +
        url.search +
        url.hash
      );
    }
  }
  const pathname = getPathname({
    locale: language,
    href: url.pathname as Parameters<typeof getPathname>[0]["href"],
  });
  return pathname + url.search + url.hash;
}

type Props = Omit<ComponentProps<typeof NextLink>, "href"> & { href: string; locale: string };

export function CetLink({ href, locale, target, ...props }: Props) {
  return (
    <NextLink
      {...props}
      href={localizedPortalHref(href, locale)}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : props.rel}
      prefetch={false}
    />
  );
}
