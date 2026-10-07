import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";

import type { Language } from "./catalog-i18n.ts";
import { firebaseDb } from "@/lib/firebase";
import type { Product } from "./products.ts";
import {
  getLocalizedProduct,
  sortManagedProducts,
  toManagedProduct,
  type ManagedProduct,
} from "./product-record.ts";

export { productIllustrationLabels, productIllustrations } from "./products.ts";
export type { ProductIllustration } from "./products.ts";

export {
  createEmptyTranslation,
  getLocalizedProduct,
  sortManagedProducts,
  toManagedProduct,
} from "./product-record.ts";

export type {
  ManagedProduct,
  ProductRecord,
  ProductStatus,
  ProductTranslation,
} from "./product-record.ts";

export const PRODUCT_COLLECTION = "products";

/**
 * Ubah dokumen snapshot menjadi daftar produk yang sudah tervalidasi.
 * Dokumen yang tidak lolos validasi runtime dilewati, bukan dirender.
 */
function mapSnapshotDocuments(
  documents: Array<{ id: string; data: () => unknown }>,
): ManagedProduct[] {
  const valid: ManagedProduct[] = [];

  for (const document of documents) {
    const product = toManagedProduct(document.id, document.data());
    if (product) valid.push(product);
  }

  return sortManagedProducts(valid);
}

/**
 * Pengambilan sekali jalan untuk dokumen berstatus "published".
 * Dipakai oleh route API dan indikator status di panel admin.
 */
export async function getPublishedFirebaseProducts(language: Language): Promise<Product[]> {
  if (!firebaseDb) return [];

  const db = firebaseDb;
  const snapshot = await getDocs(
    query(collection(db, PRODUCT_COLLECTION), where("status", "==", "published")),
  );

  return mapSnapshotDocuments(snapshot.docs).map((product) =>
    getLocalizedProduct(product, language),
  );
}

/**
 * Listener realtime untuk dokumen berstatus "published".
 * Query-nya sudah difilter sehingga lolos validasi security rules untuk
 * pengunjung tanpa login.
 */
export function subscribeToPublishedProducts(
  onChange: (products: ManagedProduct[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  if (!firebaseDb) return () => undefined;

  const db = firebaseDb;

  return onSnapshot(
    query(collection(db, PRODUCT_COLLECTION), where("status", "==", "published")),
    (snapshot) => {
      onChange(mapSnapshotDocuments(snapshot.docs));
    },
    onError,
  );
}

/**
 * Listener realtime SELURUH dokumen (termasuk draft).
 * Hanya untuk panel admin - security rules menolak listener ini bila pemanggil
 * bukan admin.
 */
export function subscribeToManagedProducts(
  onChange: (products: ManagedProduct[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  if (!firebaseDb) return () => undefined;

  const db = firebaseDb;

  return onSnapshot(
    collection(db, PRODUCT_COLLECTION),
    (snapshot) => {
      onChange(mapSnapshotDocuments(snapshot.docs));
    },
    onError,
  );
}
