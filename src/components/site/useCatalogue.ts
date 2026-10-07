"use client";

import { useEffect, useMemo, useState } from "react";

import { getLocalizedProducts, type Language } from "@/lib/catalog-i18n";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  getLocalizedProduct,
  subscribeToPublishedProducts,
  type ManagedProduct,
} from "@/lib/firebase-products";

export type CatalogueSource = "statis" | "firestore";

/**
 * Sumber produk untuk katalog dan halaman detail.
 *
 * Mulai dari katalog statis supaya HTML pertama sudah berisi produk (dan halaman
 * tetap benar tanpa Firebase), lalu naik ke Firestore begitu dokumen tersedia.
 * Bila Firestore gagal atau kosong, katalog statis yang dipakai.
 */
export function useCatalogue(language: Language = "id"): {
  products: ReturnType<typeof getLocalizedProducts>;
  source: CatalogueSource;
} {
  const [managed, setManaged] = useState<ManagedProduct[] | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    return subscribeToPublishedProducts(
      (next) => setManaged(next),
      () => setManaged([]),
    );
  }, []);

  const staticProducts = useMemo(() => getLocalizedProducts(language), [language]);

  const firestoreProducts = useMemo(
    () =>
      (managed ?? [])
        .filter((product) => product.status === "published")
        .map((product) => getLocalizedProduct(product, language)),
    [language, managed],
  );

  if (firestoreProducts.length === 0) {
    return { products: staticProducts, source: "statis" };
  }

  return { products: firestoreProducts, source: "firestore" };
}
