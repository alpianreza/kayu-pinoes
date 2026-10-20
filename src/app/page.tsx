import type { Metadata } from "next";

import { HomeView } from "@/components/site/HomeView";
import { DEFAULT_LANGUAGE } from "@/lib/i18n";
import { languageAlternates, languageMetadata } from "@/lib/locale-metadata";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

/**
 * Berkas rute ini server component; seluruh isinya ada di `HomeView`.
 * Pemisahan itu diperlukan karena berkas ber-"use client" tidak boleh
 * mengekspor `metadata`, sementara halaman beranda perlu mendeklarasikan
 * versi bahasanya sendiri lewat hreflang.
 */
export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
    languages: languageAlternates("/"),
  },
  openGraph: {
    url: "/",
    // openGraph sebuah halaman menggantikan openGraph layout sepenuhnya,
    // jadi judul dan deskripsi ditulis ulang di sini.
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    siteName: "Kayu Pinoes",
    locale: languageMetadata[DEFAULT_LANGUAGE].ogLocale,
  },
};

export default function HomePage() {
  return <HomeView />;
}
