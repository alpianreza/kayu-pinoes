"use client";

import { useEffect, useMemo, useState } from "react";

import { getLocalizedProducts, type Language } from "@/lib/catalog-i18n";
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
 */
export function useCatalogue(language: Language = "id"): {
  products: ReturnType<typeof getLocalizedProducts>;
  source: CatalogueSource;
} {
  const [managed, setManaged] = useState<ManagedProduct[] | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    return subscribeToPublishedProducts(
      (next) => setManaged(next),
      () => setManaged([]),
    );
  }, []);

  const staticProducts = useMemo(() => getLocalizedProducts(language), [language]);

  const serverProducts = useMemo(
    () =>
      (managed ?? [])
        .filter((product) => product.status === "published")
        .map((product) => getLocalizedProduct(product, language)),
    [language, managed],
  );

  if (serverProducts.length === 0) {
    return { products: staticProducts, source: "statis" };
  }

  return { products: serverProducts, source: "supabase" };
}
