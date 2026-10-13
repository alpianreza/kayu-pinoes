"use client";

import { useEffect, useMemo, useState } from "react";

import { getLocalizedProducts, type Language } from "@/lib/catalog-i18n";
import type { Product } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getLocalizedProduct,
  subscribeToPublishedProducts,
  type ManagedProduct,
} from "@/lib/supabase-products";

export type CatalogueSource = "statis" | "supabase";

/**
 * Sumber produk untuk katalog dan halaman detail.
 *
 * Mulai dari katalog statis supaya HTML pertama sudah berisi produk (dan halaman
 * tetap benar tanpa server data), lalu naik ke Supabase begitu dokumennya
 * tersedia. Bila server data gagal atau kosong, katalog statis yang dipakai.
 *
 * `initialProducts` (opsional) diisi halaman yang sudah punya daftar produk
 * dari server - supaya hasil render server dan render pertama di browser
 * selalu sama (tidak sempat menampilkan katalog bawaan yang mungkin usang).
 */
export function useCatalogue(
  language: Language = "id",
  initialProducts?: Product[],
): {
  products: ReturnType<typeof getLocalizedProducts>;
  source: CatalogueSource;
  ready: boolean;
} {
  const [managed, setManaged] = useState<ManagedProduct[] | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    return subscribeToPublishedProducts(
      (next) => setManaged(next),
      () => setManaged([]),
    );
  }, []);

  // `ready` = percobaan baca server data pertama sudah selesai (atau server data
  // memang belum dikonfigurasi). Halaman detail memakainya supaya produk dari
  // CMS tidak sempat tampil "tidak ditemukan" selagi daftar masih dimuat.
  const ready = !isSupabaseConfigured || managed !== null;

  const staticProducts = useMemo(() => getLocalizedProducts(language), [language]);

  const serverProducts = useMemo(
    () =>
      (managed ?? [])
        .filter((product) => product.status === "published")
        .map((product) => getLocalizedProduct(product, language)),
    [language, managed],
  );

  if (serverProducts.length === 0) {
    return initialProducts
      ? { products: initialProducts, source: "supabase", ready }
      : { products: staticProducts, source: "statis", ready };
  }

  return { products: serverProducts, source: "supabase", ready };
}
