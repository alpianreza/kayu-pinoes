import type { Metadata } from "next";

import { ContactView } from "@/components/site/ContactView";
import { DEFAULT_LANGUAGE } from "@/lib/i18n";
import { languageAlternates, languageMetadata } from "@/lib/locale-metadata";

export const metadata: Metadata = {
  title: "Kontak & Cara Pesan Mainan Kayu",
  description:
    "Pesan mainan kayu edukatif Kayu Pinoes: pilih produk atau minta custom, lalu balas via WhatsApp. Bisa kirim ke seluruh Indonesia.",
  alternates: {
    canonical: "/contact",
    languages: languageAlternates("/contact"),
  },
  openGraph: {
    url: "/contact",
    title: "Kontak & Cara Pesan Mainan Kayu — Kayu Pinoes",
    description:
      "Pesan mainan kayu edukatif Kayu Pinoes: pilih produk atau minta custom, lalu balas via WhatsApp. Bisa kirim ke seluruh Indonesia.",
    siteName: "Kayu Pinoes",
    locale: languageMetadata[DEFAULT_LANGUAGE].ogLocale,
  },
};

export default function ContactPage() {
  return <ContactView />;
}
