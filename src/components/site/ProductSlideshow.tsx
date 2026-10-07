"use client";

import { useEffect, useState } from "react";

import { ProductImage } from "@/components/site/ProductImage";

export type SlideImage = {
  src: string;
  alt: string;
};

/**
 * Slideshow foto produk dengan transisi silang yang halus.
 *
 * - Berhenti sendiri saat kursor berada di atasnya.
 * - Tidak berjalan otomatis bila pengunjung mengaktifkan
 *   "prefers-reduced-motion"; titik penanda tetap bisa diklik.
 */
export function ProductSlideshow({
  images,
  label,
  intervalMs = 4500,
}: {
  images: SlideImage[];
  label: string;
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || paused) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [images.length, intervalMs, paused]);

  if (images.length === 0) return null;

  return (
    <div
      className="absolute inset-0"
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {images.map((image, position) => {
        const active = position === index;

        return (
          <div
            key={image.src}
            className={`absolute inset-0 transition-opacity duration-[1100ms] ease-out ${
              active ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={!active}
          >
            <ProductImage
              src={image.src}
              alt={active ? image.alt : ""}
              sizes="(max-width: 1024px) 92vw, 46vw"
              className="object-cover"
            />
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#2A1D12]/45 to-transparent" />

      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
        {images.map((image, position) => {
          const active = position === index;

          return (
            <button
              key={image.src}
              className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                active ? "w-6 bg-[#F4C45D]" : "w-2 bg-white/55 hover:bg-white/85"
              }`}
              type="button"
              aria-label={image.alt}
              aria-current={active}
              onClick={() => setIndex(position)}
            />
          );
        })}
      </div>
    </div>
  );
}
