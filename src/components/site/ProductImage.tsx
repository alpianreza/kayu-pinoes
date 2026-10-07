"use client";

import Image from "next/image";

import { isLocalImageSource } from "@/lib/products";

/**
 * Foto produk dengan satu jalur render untuk seluruh situs.
 *
 * Aturannya satu: berkas lokal (path diawali "/") diproses next/image supaya
 * dapat optimasi ukuran; sumber luar dirender apa adanya dengan <img>,
 * karena URL yang tidak terdaftar di `remotePatterns` membuat next/image
 * melempar galat - dan admin bebas menempel URL apa pun.
 *
 * "use client" supaya komponen klien (modal pustaka foto, kartu produk) boleh
 * memakainya; komponen server tetap bisa merendernya seperti biasa.
 *
 * Selalu mengisi penuh kotak induknya: induk wajib berposisi relative dan
 * menentukan ukuran sendiri.
 */
export function ProductImage({
  src,
  alt,
  sizes = "100vw",
  priority = false,
  className = "object-cover",
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (isLocalImageSource(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- sumber luar dari admin tidak bisa dioptimasi next/image
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`absolute inset-0 size-full ${className}`}
    />
  );
}