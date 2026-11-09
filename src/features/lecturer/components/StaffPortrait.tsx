"use client";

import Image from "next/image";
import { useState } from "react";

interface StaffPortraitProps {
  name: string;
  src?: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(-2).map((part) => part[0]).join("").toUpperCase();
}

export function StaffPortrait({ name, src, className = "object-cover", sizes, priority }: StaffPortraitProps) {
  const [failed, setFailed] = useState(false);
  const pointsToPrivateStorage = Boolean(src && /https?:\/\/(localhost|127\.0\.0\.1|minio):9000/i.test(src));

  if (!src || failed || pointsToPrivateStorage) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-brand-blue text-5xl font-bold text-white" aria-label={name}>
        {initials(name)}
      </div>
    );
  }

  return <Image src={src} alt={name} fill className={className} sizes={sizes} priority={priority} onError={() => setFailed(true)} />;
}
