import { sortByOrderForDisplay } from "./product-form.ts";
import type { ManagedProduct } from "./product-record.ts";

/**
 * Bentuk filter yang dipakai toolbar produk di panel admin.
 * Dipisahkan ke modul murni agar bisa diuji tanpa environment React.
 */
export type ProductFilterState = {
  search: string;
  status: "all" | "published" | "draft";
  category: string;
  age: string;
  sortBy: "order" | "name" | "id_asc" | "id_desc";
};

export const DEFAULT_PRODUCT_FILTERS: ProductFilterState = {
  search: "",
  status: "all",
  category: "all",
  age: "all",
  sortBy: "order",
};

/**
 * Saring produk berdasarkan kata kunci, status, kategori, dan usia.
 * Hasil diurutkan lewat `sortProducts`.
 */
export function filterProducts(
  products: ManagedProduct[],
  filters: ProductFilterState,
): ManagedProduct[] {
  let result = [...products];

  const query = filters.search.trim().toLowerCase();
  if (query.length > 0) {
    result = result.filter((product) => {
      const nameId = (product.translations.id?.name || "").toLowerCase();
      const nameEn = (product.translations.en?.name || "").toLowerCase();
      const slug = (product.slug || "").toLowerCase();
      const idString = String(product.id);
      return (
        nameId.includes(query) ||
        nameEn.includes(query) ||
        slug.includes(query) ||
        idString === query
      );
    });
  }

  if (filters.status !== "all") {
    result = result.filter((product) => product.status === filters.status);
  }

  if (filters.category !== "all") {
    result = result.filter(
      (product) => (product.translations.id?.category || "") === filters.category,
    );
  }

  if (filters.age !== "all") {
    result = result.filter((product) => (product.translations.id?.age || "") === filters.age);
  }

  return sortProducts(result, filters.sortBy);
}

/** Urutkan produk berdasarkan aturan yang dipilih admin. */
export function sortProducts(
  products: ManagedProduct[],
  sortBy: ProductFilterState["sortBy"],
): ManagedProduct[] {
  const result = [...products];

  switch (sortBy) {
    case "name":
      result.sort((first, second) =>
        (first.translations.id?.name || "").localeCompare(second.translations.id?.name || ""),
      );
      break;
    case "id_desc":
      result.sort((first, second) => second.id - first.id);
      break;
    case "id_asc":
      result.sort((first, second) => first.id - second.id);
      break;
    case "order":
    default:
      return sortByOrderForDisplay(result);
  }

  return result;
}

/** Status lawanan dari status produk yang diberikan (untuk toggle). */
export function nextStatus(current: ManagedProduct["status"]): ManagedProduct["status"] {
  return current === "published" ? "draft" : "published";
}

/**
 * Apakah varian produk menampilkan harga, atau jatuh ke "Hubungi Kami".
 * Tidak pernah menampilkan "Rp 0": bila semua varian kosong harga, hasilnya false.
 */
export function hasVariantPrice(products: Pick<ManagedProduct, "variants">): boolean {
  const variants = products.variants ?? [];
  return variants.some((variant) => variant.price.trim().length > 0);
}

/** Label harga untuk ringkasan daftar: harga varian pertama, atau "Hubungi Kami". */
export function productPriceSummary(product: Pick<ManagedProduct, "variants">): string {
  const firstPriced = (product.variants ?? []).find((variant) => variant.price.trim().length > 0);
  return firstPriced ? firstPriced.price.trim() : "Hubungi Kami";
}
