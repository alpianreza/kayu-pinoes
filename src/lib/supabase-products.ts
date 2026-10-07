import type { Language } from "./catalog-i18n.ts";
import { getLocalizedProduct, type ManagedProduct } from "./product-record.ts";
import type { Product } from "./products.ts";
import { isSupabaseConfigured, productImageUrl, supabaseClient } from "./supabase.ts";
import { PRODUCT_SELECT, rowsToManagedProducts, type SupabaseProductRow } from "./supabase-model.ts";

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

export { PRODUCT_SELECT } from "./supabase-model.ts";

export const PRODUCT_TABLE = "products";

/**
 * Ambil semua baris produk (relasional) dari Supabase.
 *
 * `statusFilter` "published" dipakai katalog publik; `null` dipakai panel
 * admin (RLS yang menentukan: admin melihat draft, pengunjung tidak).
 */
async function fetchProductRows(statusFilter: "published" | null): Promise<ManagedProduct[]> {
  const client = supabaseClient();
  if (!client) return [];

  let query = client
    .from(PRODUCT_TABLE)
    .select(PRODUCT_SELECT)
    .order("sort_order", { ascending: true });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Gagal membaca produk dari server data: " + error.message);
  }

  const rows = (data ?? []) as unknown as SupabaseProductRow[];
  return rowsToManagedProducts(rows, (storagePath) => productImageUrl(storagePath));
}

/** Pengambilan sekali jalan untuk produk berstatus "published" (siap render). */
export async function getPublishedProducts(language: Language): Promise<Product[]> {
  if (!isSupabaseConfigured) return [];

  const products = await fetchProductRows("published");
  return products.map((product) => getLocalizedProduct(product, language));
}

/** Jeda antar-penyegaran daftar (dulu realtime Firestore, kini polling ringan). */
const POLL_INTERVAL_MS = 30_000;

function startPolling(
  fetchProducts: () => Promise<ManagedProduct[]>,
  onChange: (products: ManagedProduct[]) => void,
  onError: (error: Error) => void,
): () => void {
  const client = supabaseClient();
  if (!client) return () => undefined;

  let stopped = false;
  let running = false;

  const tick = async () => {
    if (stopped || running) return;
    running = true;

    try {
      const products = await fetchProducts();
      if (!stopped) onChange(products);
    } catch (error) {
      if (!stopped) onError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      running = false;
    }
  };

  void tick();
  const timer = setInterval(() => void tick(), POLL_INTERVAL_MS);

  return () => {
    stopped = true;
    clearInterval(timer);
  };
}

/** Langganan daftar produk terbit (dipakai katalog & beranda). */
export function subscribeToPublishedProducts(
  onChange: (products: ManagedProduct[]) => void,
  onError: (error: Error) => void,
): () => void {
  return startPolling(() => fetchProductRows("published"), onChange, onError);
}

/** Langganan SELURUH produk - hanya untuk panel admin (dijaga RLS). */
export function subscribeToManagedProducts(
  onChange: (products: ManagedProduct[]) => void,
  onError: (error: Error) => void,
): () => void {
  return startPolling(() => fetchProductRows(null), onChange, onError);
}
