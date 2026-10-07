import type { Metadata } from "next";

import { AboutView } from "@/components/site/AboutView";
import { DEFAULT_LANGUAGE } from "@/lib/i18n";
import { languageAlternates, languageMetadata } from "@/lib/locale-metadata";

export const metadata: Metadata = {
  title: "About — Kayu Pinoes",
  description: "How Kayu Pinoes chooses, shapes, and finishes every wooden toy.",
  alternates: {
    canonical: "/about",
    languages: languageAlternates("/about"),
  },
  openGraph: {
    url: "/about",
    title: "About — Kayu Pinoes",
    description: "How Kayu Pinoes chooses, shapes, and finishes every wooden toy.",
    locale: languageMetadata[DEFAULT_LANGUAGE].ogLocale,
  },
};

export default function AboutPage() {
  return <AboutView />;
}
