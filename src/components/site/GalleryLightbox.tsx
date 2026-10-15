"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { ProductImage } from "@/components/site/ProductImage";
import { useLanguage } from "@/components/site/LanguageProvider";
import { siteCopy } from "@/lib/site-copy";
import type { GalleryPhoto } from "@/lib/supabase-gallery";

/**
 * Modal galeri: foto besar + keterangan + navigasi sebelumnya/berikutnya.
 *
 * Menutup dengan tombol X, klik area gelap, atau Escape; panah kiri/kanan
 * keyboard memindahkan foto.
 */
export function GalleryLightbox({
  photos,
  index,
  onClose,
  onIndexChange,
}: {
  photos: GalleryPhoto[];
  index: number;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}) {
  const { language } = useLanguage();
  const copy = siteCopy[language].gallery;
  const panelRef = useRef<HTMLDivElement | null>(null);
  const photo = photos[index];
  const arrowFlip = language === "ar" ? "rotate-180" : "";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onIndexChange((index - 1 + photos.length) % photos.length);
      if (event.key === "ArrowRight") onIndexChange((index + 1) % photos.length);
    }

    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [index, photos.length, onClose, onIndexChange]);

  if (!photo) return null;

  return (
    <div
      className="kp-modal-backdrop fixed inset-0 z-50 overflow-y-auto bg-[#1B241E]/85 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={photo.caption || copy.eyebrow}
          className="relative w-full max-w-4xl rounded-[2rem] border border-white/15 bg-[#1B241E] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.45)] outline-none sm:p-4"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="absolute end-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
          >
            <X size={18} />
          </button>

          <div className="relative h-[60vh] w-full overflow-hidden rounded-[1.4rem] bg-[#101913]">
            <ProductImage
              src={photo.imageUrl}
              alt={photo.caption || copy.eyebrow}
              sizes="(max-width: 768px) 100vw, 900px"
              className="object-contain"
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 px-1">
            <button
              type="button"
              onClick={() => onIndexChange((index - 1 + photos.length) % photos.length)}
              aria-label={copy.prev}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
            >
              <ChevronLeft size={18} className={arrowFlip} />
            </button>

            <div className="min-w-0 flex-1 text-center">
              {photo.caption ? (
                <p className="text-sm font-bold leading-6 text-white">{photo.caption}</p>
              ) : null}
              <p className="text-xs text-white/60">
                {index + 1} / {photos.length}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onIndexChange((index + 1) % photos.length)}
              aria-label={copy.next}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
            >
              <ChevronRight size={18} className={arrowFlip} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
