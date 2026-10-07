import type { MetadataRoute } from "next";

import { getLocalizedProducts } from "@/lib/catalog-i18n";
import { getPublishedFirebaseProducts } from "@/lib/firebase-products";
import { DEFAULT_LANGUAGE } from "@/lib/i18n";
import { languageAlternates } from "@/lib/locale-metadata";

/**
 * Peta situs dibangun dari NEXT_PUBLIC_SITE_URL. Bila variabel itu belum diisi,
 * sitemap sengaja kosong alih-alih memakai alamat karangan.
 *
 * Produk diambil dari Firestore bila tersedia (supaya produk buatan admin ikut
 * terpetakan), dengan katalog bawaan sebagai cadangan. Setiap alamat
 * menyertakan ketiga versinya lewat `?lang=`, sama seperti hreflang di halaman.
 */
async function collectProductSlugs(base: string): Promise<MetadataRoute.Sitemap> {
  let products: Array<{ slug: string }> = getLocalizedProducts(DEFAULT_LANGUAGE);

  try {
    const firestoreProducts = await getPublishedFirebaseProducts(DEFAULT_LANGUAGE);
    if (firestoreProducts.length > 0) products = firestoreProducts;
  } catch {
    // Firestore tidak terjangkau saat build; pakai katalog bawaan.
  }

  // Katalog bawaan dan Firestore bisa memuat slug yang sama.
  const seen = new Set<string>();

  return products
    .filter((product) => (seen.has(product.slug) ? false : seen.add(product.slug)))
    .map((product) => ({
      url: `${base}/products/${product.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: { languages: languageAlternates(`${base}/products/${product.slug}`) },
    }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (!raw) return [];

  const base = raw.endsWith("/") ? raw.slice(0, -1) : raw;

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1, alternates: { languages: languageAlternates(`${base}/`) } },
    { url: `${base}/products`, changeFrequency: "weekly", priority: 0.9, alternates: { languages: languageAlternates(`${base}/products`) } },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6, alternates: { languages: languageAlternates(`${base}/about`) } },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.6, alternates: { languages: languageAlternates(`${base}/contact`) } },
  ];

  return [...pages, ...(await collectProductSlugs(base))];
}