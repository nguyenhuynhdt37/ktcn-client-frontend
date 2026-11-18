import { createElement, forwardRef, type ComponentProps, type ForwardedRef } from "react";
import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // Danh sách các locale được hỗ trợ
  locales: ["vi", "en"],

  // Locale mặc định khi không tìm thấy locale phù hợp trên URL
  defaultLocale: "vi",

  // Cấu hình localePrefix: 'always' (luôn hiển thị /vi hoặc /en trên URL)
  localePrefix: "always",

  // Bản địa hóa đường dẫn (Localized Pathnames) tối ưu SEO theo ngôn ngữ
  pathnames: {
    "/": "/",
    "/tin-tuc": {
      vi: "/tim-kiem",
      en: "/search",
    },
    "/tin-tuc/[slug]": {
      vi: "/[slug]",
      en: "/[slug]",
    },
    "/bo-mon/[slug]": {
      vi: "/bo-mon/[slug]",
      en: "/departments/[slug]",
    },
    "/khoa/[slug]": {
      vi: "/khoa/[slug]",
      en: "/faculties/[slug]",
    },
    "/nhan-su/[slug]": {
      vi: "/nhan-su/[slug]",
      en: "/staffs/[slug]",
    },
    "/lich-tuan": {
      vi: "/lich-tuan",
      en: "/weekly-calendar",
    },
    "/lich-tuan/[slug]": {
      vi: "/lich-tuan/[slug]",
      en: "/weekly-calendar/[slug]",
    },
    "/gioi-thieu": {
      vi: "/gioi-thieu",
      en: "/about",
    },
    "/gioi-thieu/can-bo": {
      vi: "/gioi-thieu/can-bo",
      en: "/about/staff",
    },
    "/tu-van-tuyen-sinh": {
      vi: "/tu-van-tuyen-sinh",
      en: "/admissions-consultation",
    },
    "/thong-bao": {
      vi: "/thong-bao",
      en: "/notifications",
    },
    "/gioi-thieu/cac-khoa-dao-tao": {
      vi: "/gioi-thieu/cac-khoa-dao-tao",
      en: "/about/faculties",
    },
    "/dao-tao": {
      vi: "/dao-tao",
      en: "/academics",
    },
    "/dao-tao/dai-hoc": {
      vi: "/dao-tao/dai-hoc",
      en: "/academics/undergraduate",
    },
    "/dao-tao/dai-hoc/[slug]": {
      vi: "/dao-tao/dai-hoc/[slug]",
      en: "/academics/undergraduate/[slug]",
    },
    "/dao-tao/sau-dai-hoc": {
      vi: "/dao-tao/sau-dai-hoc",
      en: "/academics/postgraduate",
    },
    "/dao-tao/sau-dai-hoc/[slug]": {
      vi: "/dao-tao/sau-dai-hoc/[slug]",
      en: "/academics/postgraduate/[slug]",
    },
  },
});

// Wrappers bao quanh API điều hướng Next.js tương thích với routing i18n.
// prefetch mặc định tắt: trang chưa mở không tải JavaScript. Truyền prefetch={true} khi cần.
const navigation = createNavigation(routing);
const IntlLink = navigation.Link;

export const { redirect, usePathname, useRouter, getPathname } = navigation;

type IntlLinkProps = ComponentProps<typeof IntlLink>;
export type IntlHref = IntlLinkProps["href"];
export type RouterHref = Parameters<ReturnType<typeof navigation.useRouter>["push"]>[0];

type LinkProps = Omit<IntlLinkProps, "href"> & {
  href: IntlHref | string;
};

export const Link = forwardRef(function Link(
  { prefetch = false, href, ...props }: LinkProps,
  ref: ForwardedRef<HTMLAnchorElement>,
) {
  return createElement(IntlLink, {
    ...props,
    href: href as IntlHref,
    prefetch,
    ref,
  });
});
