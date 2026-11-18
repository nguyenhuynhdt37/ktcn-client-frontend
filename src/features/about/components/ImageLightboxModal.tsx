"use client";

import { useCallback, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: { src: string; title: string }[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}

export function ImageLightboxModal({
  isOpen,
  onClose,
  images,
  activeIndex,
  onActiveIndexChange,
}: ImageLightboxModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handlePrev = useCallback(() => {
    if (images.length === 0) return;
    onActiveIndexChange((activeIndex - 1 + images.length) % images.length);
  }, [activeIndex, images.length, onActiveIndexChange]);

  const handleNext = useCallback(() => {
    if (images.length === 0) return;
    onActiveIndexChange((activeIndex + 1) % images.length);
  }, [activeIndex, images.length, onActiveIndexChange]);

  // Lock body scroll and focus close button when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Handle keyboard events (Left, Right, Escape)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[activeIndex] ?? images[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={currentImage.title}
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 backdrop-blur-md transition-all duration-300"
    >
      {/* Close button top right */}
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 z-[10000] cursor-pointer rounded-full border border-white/10 bg-white/5 p-3 text-white/80 transition-all hover:scale-105 hover:bg-white/10 hover:text-white"
        aria-label="Close modal"
      >
        <X size={24} aria-hidden="true" />
      </button>

      {/* Main Image View */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full flex-col items-center justify-center p-6 select-none md:p-12"
      >
        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute top-1/2 left-6 z-[10000] flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/85 shadow-lg transition-all hover:scale-105 hover:bg-white/10 hover:text-white md:left-12 md:h-14 md:w-14"
          aria-label="Previous image"
        >
          <ChevronLeft size={28} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="absolute top-1/2 right-6 z-[10000] flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/85 shadow-lg transition-all hover:scale-105 hover:bg-white/10 hover:text-white md:right-12 md:h-14 md:w-14"
          aria-label="Next image"
        >
          <ChevronRight size={28} aria-hidden="true" />
        </button>

        {/* Center Container for Image */}
        <div className="animate-fade-in relative flex h-full max-h-[75vh] w-full max-w-5xl items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage.src}
            alt={currentImage.title}
            className="max-h-full max-w-full rounded-lg border border-white/5 object-contain shadow-2xl"
          />
        </div>

        {/* Caption & Counter */}
        <div className="mt-6 max-w-2xl px-6 text-center">
          <p className="text-base leading-snug font-bold tracking-wide text-white drop-shadow-sm md:text-lg">
            {currentImage.title}
          </p>
          <p className="mt-2 text-xs font-semibold tracking-widest text-white/75 md:text-sm">
            {activeIndex + 1} / {images.length}
          </p>
        </div>
      </div>
    </div>
  );
}
