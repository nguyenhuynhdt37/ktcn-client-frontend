"use client";

import Image from "next/image";
import { useState } from "react";
import { initials } from "../utils/inner";
import styles from "../cet-inner.module.css";

/**
 * Circular staff portrait. Falls back to initials when there is no image or it fails to load
 * (unlike SafeImage, never substitutes an unrelated stock photo for a person).
 */
export function CetAvatar({ name, src }: { name: string; src?: string | null }) {
  const [failed, setFailed] = useState(false);
  const privateStorage = Boolean(src && /https?:\/\/(localhost|127\.0\.0\.1|minio):9000/i.test(src));
  const showImage = Boolean(src) && !failed && !privateStorage;

  return (
    <span className={styles.avatar}>
      {showImage ? (
        <Image
          src={src as string}
          alt=""
          fill
          sizes="96px"
          className={styles.avatarImage}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={styles.avatarFallback} aria-hidden="true">
          {initials(name)}
        </span>
      )}
    </span>
  );
}
