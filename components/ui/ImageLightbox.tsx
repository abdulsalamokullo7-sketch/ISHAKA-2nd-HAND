"use client";

import Image from "next/image";
import { useEffect } from "react";

type Props = {
  src: string | null;
  alt: string;
  open: boolean;
  onClose: () => void;
};

export function ImageLightbox({ src, alt, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !src) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Product image enlarged"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white backdrop-blur hover:bg-white/20"
      >
        Close
      </button>
      <div
        className="relative h-[min(88vh,920px)] w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>
    </div>
  );
}
