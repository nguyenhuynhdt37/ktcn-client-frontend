"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BannerResponse } from "../types/banner.types";
import { useLocale } from "next-intl";
import { getLocalizedField } from "@/features/article/utils/map-article";

interface HeroSliderProps {
  banners: BannerResponse[];
}

export function HeroSlider({ banners }: HeroSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const locale = useLocale();

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onInit = useCallback((api: NonNullable<typeof emblaApi>) => {
    setScrollSnaps(api.scrollSnapList());
  }, []);

  const onSelect = useCallback((api: NonNullable<typeof emblaApi>) => {
    setSelectedIndex(api.selectedScrollSnap());
    setPrevBtnDisabled(!api.canScrollPrev());
    setNextBtnDisabled(!api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const initHandle = requestAnimationFrame(() => {
      onInit(emblaApi);
      onSelect(emblaApi);
    });

    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);

    return () => {
      cancelAnimationFrame(initHandle);
    };
  }, [emblaApi, onInit, onSelect]);

  // Tự động chạy slide sau 5 giây
  useEffect(() => {
    if (!emblaApi) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const intervalId = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [emblaApi]);

  // Nếu không có banner nào đang hoạt động, trả về null hoặc ảnh placeholder mặc định
  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-100"
      aria-label={locale === "en" ? "Featured information" : "Thông tin nổi bật"}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner, index) => {
            const title = getLocalizedField<string>(banner, "title", locale);
            const description = getLocalizedField<string>(banner, "description", locale);

            const SlideContent = (
              <div className="relative aspect-[16/9] md:aspect-[2.39/1] w-full min-w-0 flex-[0_0_100%]">
                <Image
                  src={banner.desktop_image_object_key}
                  alt={title}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover"
                />


              </div>
            );

            // Xác định href dựa trên target_type mới của Banner
            let bannerHref: any = null;
            if (banner.target_type === "ARTICLE" && banner.article_id) {
              bannerHref = { pathname: "/tin-tuc/[slug]" as const, params: { slug: banner.article_id } };
            } else if (banner.target_type === "EXTERNAL" && banner.link_url) {
              bannerHref = banner.link_url;
            } else if (!banner.target_type && banner.link_url) {
              // Fallback cho dữ liệu banner cũ
              bannerHref = banner.link_url;
            }

            // Nếu banner có link, bọc toàn bộ slide bằng thẻ Link
            if (bannerHref) {
              return (
                <Link
                  key={banner.id}
                  href={bannerHref}
                  target={banner.open_in_new_tab && banner.target_type !== "ARTICLE" ? "_blank" : undefined}
                  className="relative block min-w-0 flex-[0_0_100%]"
                >
                  {SlideContent}
                </Link>
              );
            }

            return (
              <div key={banner.id} className="min-w-0 flex-[0_0_100%]">
                {SlideContent}
              </div>
            );
          })}
        </div>
      </div>

      {/* Nút prev / next (Chỉ hiện khi có từ 2 slide) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
            className="absolute top-1/2 left-5 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-slate-950/35 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-slate-950/60 disabled:pointer-events-none disabled:opacity-30 sm:flex"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <button
            onClick={scrollNext}
            disabled={nextBtnDisabled}
            className="absolute top-1/2 right-5 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-slate-950/35 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-slate-950/60 disabled:pointer-events-none disabled:opacity-30 sm:flex"
            aria-label="Next Slide"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        </>
      )}

      {/* Dots navigation */}
      {banners.length > 1 && (
        <div className="absolute bottom-1 left-1/2 z-10 flex -translate-x-1/2 gap-0.5">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className="flex size-11 items-center justify-center rounded-full"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selectedIndex ? "true" : undefined}
            >
              <span
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  index === selectedIndex ? "w-7 bg-white" : "w-2 bg-white/50"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
