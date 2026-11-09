"use client";

import { useState, useEffect, Suspense } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Facebook, MessageSquare, Search, Clock, CloudSun } from "lucide-react";
import { LanguageSwitcher } from "@/features/language/components/LanguageSwitcher";
import type { Language } from "@/features/language/types/language.types";
import { ClientNotificationBell } from "@/features/notification/components/ClientNotificationBell";

interface TopBarProps {
  initialLanguages?: Language[];
}

export function TopBar({ initialLanguages }: TopBarProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [timeString, setTimeString] = useState("");
  const [weather, setWeather] = useState<{ temp: number; description: string } | null>(null);

  useEffect(() => {
    // 1. Cập nhật thời gian thực tế
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
      try {
        const localeString = locale === "en" ? "en-US" : "vi-VN";
        const formatted = now.toLocaleDateString(localeString, options);
        // Sửa định dạng dấu phẩy sang gạch ngang
        setTimeString(formatted.replace(",", " -"));
      } catch {
        setTimeString("");
      }
    };

    updateTime();
    const intervalId = setInterval(updateTime, 60000);

    // 2. Fetch thời tiết thực tế Vinh từ Open-Meteo
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=18.6734&longitude=105.6924&current=temperature_2m,weather_code",
        );
        const data = await res.json();
        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;

        let description = locale === "en" ? "Sunny" : "Nắng";
        if (code >= 1 && code <= 3) description = locale === "en" ? "Partly Cloudy" : "Ít mây";
        else if (code >= 45 && code <= 48) description = locale === "en" ? "Foggy" : "Sương mù";
        else if (code >= 51 && code <= 67) description = locale === "en" ? "Light Rain" : "Mưa nhẹ";
        else if (code >= 71 && code <= 86) description = locale === "en" ? "Snowy" : "Tuyết";
        else if (code >= 95) description = locale === "en" ? "Thunderstorm" : "Giông bão";
        else if (code === 0) description = locale === "en" ? "Clear Sky" : "Trời quang";

        setWeather({ temp, description });
      } catch (error) {
        console.error("Failed to fetch weather", error);
        setWeather({ temp: 28, description: locale === "en" ? "Cloudy" : "Nhiều mây" });
      }
    };

    fetchWeather();

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Điều hướng hoặc xử lý tìm kiếm
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="bg-brand-darkred-dark relative z-50 border-b border-white/10 text-sm text-white">
      <div className="site-container flex min-h-11 items-center justify-between gap-4">
        {/* Địa chỉ, thời gian và thời tiết (Ẩn trên thiết bị di động) */}
        <div className="hidden min-w-0 items-center gap-2 text-white/75 md:flex">
          <MapPin size={15} className="text-brand-yellow shrink-0" aria-hidden="true" />
          <span className="mr-1 truncate">{t("school_address")}</span>

          {timeString && (
            <span className="mx-1 hidden text-white/30 lg:inline" aria-hidden="true">
              |
            </span>
          )}
          {timeString && (
            <span className="hidden items-center gap-1.5 whitespace-nowrap lg:flex">
              <Clock size={14} className="text-brand-yellow shrink-0" aria-hidden="true" />
              <span>{timeString}</span>
            </span>
          )}

          {weather && (
            <span className="mx-1 hidden text-white/30 lg:inline" aria-hidden="true">
              |
            </span>
          )}
          {weather && (
            <span className="hidden items-center gap-1.5 whitespace-nowrap lg:flex">
              <CloudSun size={15} className="text-brand-yellow shrink-0" aria-hidden="true" />
              <span>
                Vinh: {weather.temp}°C ({weather.description})
              </span>
            </span>
          )}
        </div>

        {/* Liên kết xã hội, Tìm kiếm & Ngôn ngữ */}
        <div className="flex w-full items-center justify-between gap-2 md:w-auto md:justify-end">
          {/* Mạng xã hội & Ngôn ngữ */}
          <div className="flex items-center">
            <ClientNotificationBell />
            <a
              href="https://www.facebook.com/Vienktcn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-yellow inline-flex size-11 items-center justify-center text-white/75 transition-colors duration-150"
              aria-label="Facebook"
            >
              <Facebook size={16} aria-hidden="true" />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-yellow inline-flex size-11 items-center justify-center text-white/75 transition-colors duration-150"
              aria-label="Messenger"
            >
              <MessageSquare size={16} aria-hidden="true" />
            </a>

            {/* Component chọn ngôn ngữ i18n Dropdown */}
            <Suspense fallback={<div className="h-9 w-24 animate-pulse rounded-md bg-white/10" />}>
              <LanguageSwitcher initialLanguages={initialLanguages} />
            </Suspense>
          </div>

          {/* Ô tìm kiếm */}
          <form
            onSubmit={handleSearch}
            className="relative flex min-w-0 flex-1 items-center md:flex-none"
          >
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:border-brand-yellow/60 focus:ring-brand-yellow/30 h-9 w-full min-w-0 rounded-md border border-white/15 bg-white/10 pr-10 pl-3 text-sm text-white transition-colors duration-150 placeholder:text-white/65 focus:ring-2 focus:outline-none sm:w-48"
            />
            <button
              type="submit"
              className="hover:text-brand-yellow absolute right-0 inline-flex size-9 items-center justify-center rounded-md text-white/75 transition-colors duration-150"
              aria-label="Submit Search"
            >
              <Search size={15} aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
