import type { Metadata } from "next";

import { GalleryView } from "@/components/site/GalleryView";
import { DEFAULT_LANGUAGE } from "@/lib/i18n";
import { languageAlternates, languageMetadata } from "@/lib/locale-metadata";

export const metadata: Metadata = {
  title: "Galeri: Proses Pembuatan Mainan Kayu",
  description:
    "Intip bengkel Kayu Pinoes: memilih kayu pinus, membentuk, mengampelas, dan menyelesaikan setiap mainan kayu edukatif.",
  alternates: {
    canonical: "/gallery",
    languages: languageAlternates("/gallery"),
  },
  openGraph: {
    url: "/gallery",
    title: "Galeri: Proses Pembuatan Mainan Kayu — Kayu Pinoes",
    description:
      "Intip bengkel Kayu Pinoes: memilih kayu pinus, membentuk, mengampelas, dan menyelesaikan setiap mainan kayu edukatif.",
    siteName: "Kayu Pinoes",
    locale: languageMetadata[DEFAULT_LANGUAGE].ogLocale,
  },
};

export default function GalleryPage() {
  return <GalleryView />;
}
