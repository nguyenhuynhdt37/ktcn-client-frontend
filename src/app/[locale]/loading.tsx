import Image from "next/image";
import loadingLogo from "@/shared/assets/logo-320.webp";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo SET VinhUni */}
          <div className="relative">
            <Image
              src={loadingLogo}
              alt="SET VinhUni"
              width={56}
              height={56}
              className="animate-pulse"
              loading="eager"
            />
            {/* Vòng xoay quanh logo */}
            <div
              className="absolute -inset-3 animate-spin rounded-full border-2 border-transparent border-t-brand-darkred/60"
              style={{ animationDuration: "1.2s" }}
            />
          </div>

          {/* Thanh loading */}
          <div className="h-1 w-32 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full w-full rounded-full bg-gradient-to-r from-brand-darkred via-red-500 to-brand-darkred animate-loading-bar"
              style={{
                animation: "loading-bar 1.5s ease-in-out infinite",
              }}
            />
          </div>

          <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">SET VinhUni</p>
        </div>
      </div>

      {/* CSS animation inline */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `,
        }}
      />
    </div>
  );
}
