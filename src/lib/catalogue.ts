import type { Product } from "@/lib/products";

export type AgeBucket = "all" | "0-2" | "2-4" | "4-6";
export type SortKey = "catalog" | "name" | "age-youngest" | "age-oldest";

/**
 * Batas usia untuk filter. `label` sengaja tidak disimpan di sini: teksnya
 * hidup di `site-copy.ts` per bahasa (lihat bucketLabels di CatalogView),
 * sehingga satu sumber teks tetap terjaga.
 */
export const ageBuckets: Array<{ key: AgeBucket; min: number; max: number }> = [
  { key: "all", min: 0, max: 99 },
  { key: "0-2", min: 0, max: 2 },
  { key: "2-4", min: 2, max: 4 },
  { key: "4-6", min: 4, max: 6 },
];

/** Urutan pilihan pengurutan; teksnya juga diambil dari `site-copy.ts`. */
export const sortOptions: Array<{ key: SortKey }> = [
  { key: "catalog" },
  { key: "name" },
  { key: "age-youngest" },
  { key: "age-oldest" },
];

/**
 * Lowest age mentioned in an age string, e.g. "1–4 years" -> 1.
 *
 * Angka dibaca tanpa membatasi jumlah digit: menulis "10–12 years" harus tetap
 * terbaca sebagai 10, bukan 10 dipotong jadi "10" yang kebetulan sama pada dua
 * digit tetapi gagal pada nilai seperti "100". Teks Arab memakai angka
 * Arab-Indic yang tidak cocok di sini; hasilnya null dan produk tetap
 * ditampilkan, bukan disembunyikan.
 */
export function minAgeOf(age: string): number | null {
  const match = /\d+/.exec(age);
  if (!match) return null;

  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
}

/** Highest age mentioned in an age range, e.g. "1–4 years" -> 4. */
export function maxAgeOf(age: string): number | null {
  const matches = age.match(/\d+/g);
  if (!matches || matches.length === 0) return null;

  const value = Number(matches[matches.length - 1]);
  return Number.isFinite(value) ? value : null;
}

export function matchesAgeBucket(age: string, bucket: AgeBucket): boolean {
  if (bucket === "all") return true;

  const definition = ageBuckets.find((item) => item.key === bucket);
  if (!definition) return true;

  const lowest = minAgeOf(age);
  const highest = maxAgeOf(age);

  // Age not readable (e.g. Arabic text): never hide the product.
  if (lowest === null || highest === null) return true;

  // Show when the product's range overlaps the filter's range.
  return lowest <= definition.max && highest >= definition.min;
}

export function matchesQuery(
  product: Pick<Product, "name" | "description" | "category">,
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return true;

  return [product.name, product.description, product.category]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

export function sortProducts<T extends Pick<Product, "id" | "name" | "age">>(
  products: T[],
  sort: SortKey,
): T[] {
  const sorted = [...products];
  const locale = "en";

  switch (sort) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, locale));
    case "age-youngest":
      return sorted.sort((a, b) => (minAgeOf(a.age) ?? 99) - (minAgeOf(b.age) ?? 99) || a.id - b.id);
    case "age-oldest":
      return sorted.sort((a, b) => (maxAgeOf(b.age) ?? -1) - (maxAgeOf(a.age) ?? -1) || a.id - b.id);
    case "catalog":
    default:
      return sorted.sort((a, b) => a.id - b.id);
  }
}
