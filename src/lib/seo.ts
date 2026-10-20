import type { Product } from "./products.ts";

/**
 * Data terstruktur (schema.org) untuk mesin pencari.
 *
 * Fungsi-fungsi di sini murni: menerima data, mengembalikan objek JSON-LD -
 * tanpa membaca proses.env atau jaringan - supaya bisa diuji langsung di Node
 * dan dipakai dari komponen server mana pun.
 */

export const SITE_NAME = "Kayu Pinoes";

/** Judul dan deskripsi bawaan seluruh situs, dipakai layout dan beranda. */
export const SITE_TITLE = "Kayu Pinoes — Mainan Kayu Edukatif dari Kayu Pinus";
export const SITE_DESCRIPTION =
  "Kayu Pinoes membuat mainan kayu edukatif handmade dari kayu pinus pilihan — aman untuk tangan kecil, tahan lama, dan bisa custom. Kirim ke seluruh Indonesia.";
/** Kata kunci utama situs. */
export const SITE_KEYWORDS: string[] = [
  "mainan kayu edukatif",
  "mainan kayu pinus",
  "mainan kayu",
  "mainan anak dari kayu",
  "wooden educational toys",
];

/** Alamat dasar situs: tanpa spasi, tanpa garis miring di akhir. */
export function normalizeBaseUrl(siteUrl: string | null | undefined): string {
  return (siteUrl ?? "").trim().replace(/\/+$/, "");
}

/** Jadikan alamat gambar absolut (path lokal digabung dengan alamat situs). */
export function absoluteImageUrl(imageUrl: string, siteUrl: string): string {
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return siteUrl + (imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl);
}

/**
 * Organisasi (schema.org/Organization) untuk seluruh situs.
 *
 * Nomor WhatsApp ikut sebagai kanal kontak bila benar-benar dikonfigurasi -
 * tidak ada nomor atau tautan yang dikarang saat env kosong.
 */
export function organizationJsonLd(options: {
  siteUrl: string;
  whatsappNumber?: string | null;
  instagramUrl?: string;
}) {
  const {
    siteUrl,
    whatsappNumber = null,
    instagramUrl = "https://instagram.com/kayupinoes",
  } = options;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: `${siteUrl}/`,
    logo: `${siteUrl}/images/brand/logo-mark.png`,
    description:
      "Mainan kayu edukatif handmade dari kayu pinus, dibuat di Indonesia.",
    areaServed: "ID",
    sameAs: [instagramUrl],
    ...(whatsappNumber
      ? {
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "sales",
              telephone: `+${whatsappNumber}`,
              url: `https://wa.me/${whatsappNumber}`,
              availableLanguage: ["id", "en", "ar"],
            },
          ],
        }
      : {}),
  };
}

/** Produk (schema.org/Product) untuk halaman detail. */
export function productJsonLd(product: Product, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url: `${siteUrl}/products/${product.slug}`,
    brand: { "@type": "Brand", name: SITE_NAME },
    ...(product.category ? { category: product.category } : {}),
    ...(product.wood ? { material: product.wood } : {}),
    ...(product.imageUrl
      ? { image: [absoluteImageUrl(product.imageUrl, siteUrl)] }
      : {}),
  };
}

export type BreadcrumbEntry = { name: string; url: string };

/** Remah roti (schema.org/BreadcrumbList) untuk halaman detail produk. */
export function breadcrumbJsonLd(entries: BreadcrumbEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.url,
    })),
  };
}
export type FaqItem = { q: string; a: string };

/**
 * Tanya-jawab (schema.org/FAQPage).
 *
 * Teksnya berasal dari sumber yang sama dengan yang tampil di halaman, jadi
 * tidak ada dua versi jawaban yang bisa menyimpang.
 */
export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}
