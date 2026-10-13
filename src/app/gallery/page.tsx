import type { Metadata } from "next";

import { GalleryView } from "@/components/site/GalleryView";
import { DEFAULT_LANGUAGE } from "@/lib/i18n";
import { languageAlternates, languageMetadata } from "@/lib/locale-metadata";

export const metadata: Metadata = {
  title: "Gallery — Kayu Pinoes",
  description:
    "A look into our workshop: how each Kayu Pinoes wooden toy is made — choosing wood, shaping, sanding, and finishing.",
  alternates: {
    canonical: "/gallery",
    languages: languageAlternates("/gallery"),
  },
  openGraph: {
    url: "/gallery",
    title: "Gallery — Kayu Pinoes",
    description:
      "A look into our workshop: how each Kayu Pinoes wooden toy is made — choosing wood, shaping, sanding, and finishing.",
    locale: languageMetadata[DEFAULT_LANGUAGE].ogLocale,
  },
};

export default function GalleryPage() {
  return <GalleryView />;
}
