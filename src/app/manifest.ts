import type { MetadataRoute } from "next";

import { DEFAULT_LANGUAGE } from "@/lib/i18n";
import { languageDirections } from "@/lib/locale-metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kayu Pinoes — Woodentoys and Montessori",
    short_name: "Kayu Pinoes",
    description:
      "Galeri mainan kayu Kayu Pinoes yang dibuat untuk tangan kecil dan imajinasi besar.",
    // Ikut bahasa bawaan situs, supaya aplikasi yang dipasang di perangkat
    // membaca arah teks dengan benar.
    lang: DEFAULT_LANGUAGE,
    dir: languageDirections(DEFAULT_LANGUAGE),
    start_url: "/",
    display: "standalone",
    background_color: "#FBF9F3",
    theme_color: "#314B3A",
    icons: [
      {
        src: "/images/brand/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
