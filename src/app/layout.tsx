import type { Metadata } from "next";
import { Cairo, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import "./globals.css";

import { LanguageProvider } from "@/components/site/LanguageProvider";
import { DEFAULT_LANGUAGE } from "@/lib/i18n";
import { languageDirections, languageMetadata } from "@/lib/locale-metadata";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/$/, "");

/**
 * Tipografi situs, dimuat lewat next/font.
 *
 * next/font mengunduh font saat build, menyimpannya sendiri di berkas build,
 * dan menyisipkan tautan pramuat - jadi tidak ada permintaan jaringan ke
 * Google ketika pengunjung membuka situs, dan tidak ada lompatan tata letak
 * (CLS) karena cadangan sistem dipakai sampai font-nya siap.
 *
 * - Fraunces : judul. Serif hangat dengan lengkung lembut, cocok untuk
 *   merek mainan kayu. Berkas yang diunduh adalah versi variabelnya, jadi
 *   sumbu optical size tetap jalan: judul 60px tampil lebih tegas daripada
 *   teks 18px - lihat font-optical-sizing di globals.css.
 * - Plus Jakarta Sans : teks. Rancangannya bulat dan bersahabat,
 *   huruf kecilnya terbuka sehingga mudah dibaca pada ukuran kartu.
 * - Cairo : bahasa Arab. next/font memotong subset-nya ke karakter Arab saja
 *   untuk berkas yang dikirim, dan dipakai lewat `:lang(ar)` di globals.css.
 */
const displayFont = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const arabicFont = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kayu Pinoes — Mainan kayu untuk tumbuh bersama",
  description: "Galeri mainan kayu Kayu Pinoes yang dibuat untuk tangan kecil dan imajinasi besar.",
  // metadataBase hanya diset bila alamat situs sudah diketahui dari
  // NEXT_PUBLIC_SITE_URL. Tanpa alamat itu, gambar Open Graph bertaut relatif
  // akan diselesaikan ke alamat yang salah, jadi gambar itu sengaja tidak
  // dipasang sama sekali - bukan ditebak.
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  openGraph: {
    title: "Kayu Pinoes — Mainan kayu untuk tumbuh bersama",
    description: "Galeri mainan kayu Kayu Pinoes yang dibuat untuk tangan kecil dan imajinasi besar.",
    type: "website",
    // Locale mengikuti bahasa bawaan situs, bukan nilai yang diketik manual -
    // kalau DEFAULT_LANGUAGE berubah, metadata ini ikut.
    locale: languageMetadata[DEFAULT_LANGUAGE].ogLocale,
    siteName: "Kayu Pinoes",
    ...(siteUrl
      ? {
          images: [
            {
              url: "/images/pinoes-hero-toys.png",
              width: 1024,
              height: 1024,
              alt: "Susunan mainan kayu Kayu Pinoes",
            },
          ],
        }
      : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: "Kayu Pinoes — Mainan kayu untuk tumbuh bersama",
    description: "Galeri mainan kayu Kayu Pinoes yang dibuat untuk tangan kecil dan imajinasi besar.",
    ...(siteUrl ? { images: ["/images/pinoes-hero-toys.png"] } : {}),
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Atribut awal diturunkan dari DEFAULT_LANGUAGE supaya tidak pernah
  // menyimpang dari bahasa yang benar-benar ditampilkan saat render pertama.
  // Setelah mount, LanguageProvider memperbaruinya mengikuti pilihan tersimpan
  // di browser. Nilai statis di sini juga membuat halaman tetap bisa dirender
  // statis (tanpa membaca cookie).
  return (
    <html
      lang={DEFAULT_LANGUAGE}
      dir={languageDirections(DEFAULT_LANGUAGE)}
      className={`${displayFont.variable} ${bodyFont.variable} ${arabicFont.variable}`}
    >
      <body>
        {/* NuqsAdapter menghubungkan hook nuqs ke router Next.js; dipakai
            CatalogView untuk menyimpan filter katalog di URL. */}
        <NuqsAdapter>
          <LanguageProvider>{children}</LanguageProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
