import type { Metadata } from "next";

import { AboutView } from "@/components/site/AboutView";
import { DEFAULT_LANGUAGE } from "@/lib/i18n";
import { languageAlternates, languageMetadata } from "@/lib/locale-metadata";
import { faqJsonLd } from "@/lib/seo";
import { siteCopy } from "@/lib/site-copy";

const description =
  "Cara Kayu Pinoes memilih kayu pinus, membentuk, dan menghaluskan setiap mainan kayu edukatif — dari bengkel kecil di Indonesia.";

export const metadata: Metadata = {
  title: "Tentang Kami: Pengrajin Mainan Kayu Pinus",
  description,
  alternates: {
    canonical: "/about",
    languages: languageAlternates("/about"),
  },
  openGraph: {
    url: "/about",
    title: "Tentang Kami: Pengrajin Mainan Kayu Pinus — Kayu Pinoes",
    description,
    siteName: "Kayu Pinoes",
    locale: languageMetadata[DEFAULT_LANGUAGE].ogLocale,
  },
};

export default function AboutPage() {
  // Tanya-jawab diambil dari teks yang sama dengan yang tampil di halaman,
  // supaya data terstruktur dan isi terlihat tidak pernah berbeda.
  const faq = faqJsonLd(siteCopy.id.about.faq.items);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <AboutView />
    </>
  );
}
