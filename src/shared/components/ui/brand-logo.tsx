"use client";

import Image, { type ImageLoaderProps } from "next/image";
import logo320 from "@/shared/assets/logo-320.webp";
import logo480 from "@/shared/assets/logo-480.webp";
import logo640 from "@/shared/assets/logo-640.webp";
import logo960 from "@/shared/assets/logo-960.webp";
import logo1280 from "@/shared/assets/logo-1280.webp";
import logo2048 from "@/shared/assets/logo-2048.webp";

const variants = [logo320, logo480, logo640, logo960, logo1280, logo2048];

function logoLoader({ width }: ImageLoaderProps) {
  return (variants.find((image) => image.width >= width) ?? logo2048).src;
}

export function BrandLogo({
  sizes,
  className,
  eager = false,
}: {
  sizes: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <Image
      src={logo2048}
      loader={logoLoader}
      alt="Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh"
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      className={className}
    />
  );
}
