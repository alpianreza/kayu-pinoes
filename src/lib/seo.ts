import type { Product } from "./products.ts";

/**
 * Data terstruktur (schema.org) untuk mesin pencari.
 *
 * Fungsi-fungsi di sini murni: menerima data, mengembalikan objek JSON-LD -
 * tanpa membaca proses.env atau jaringan - supaya bisa diuji langsung di Node
 * dan dipakai dari komponen server mana pun.
 */

export const SITE_NAME = "Kayu Pinoes";

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
      "Handmade wooden toys for growing together — made in Indonesia.",
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
