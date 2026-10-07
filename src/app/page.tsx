import type { Metadata } from "next";

import { HomeView } from "@/components/site/HomeView";
import { DEFAULT_LANGUAGE } from "@/lib/i18n";
import { languageAlternates, languageMetadata } from "@/lib/locale-metadata";

/**
 * Berkas rute ini server component; seluruh isinya ada di `HomeView`.
 * Pemisahan itu diperlukan karena berkas ber-"use client" tidak boleh
 * mengekspor `metadata`, sementara halaman beranda perlu mendeklarasikan
 * versi bahasanya sendiri lewat hreflang.
 */
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: languageAlternates("/"),
  },
  openGraph: {
    url: "/",
    locale: languageMetadata[DEFAULT_LANGUAGE].ogLocale,
  },
};

export default function HomePage() {
  return <HomeView />;
}
