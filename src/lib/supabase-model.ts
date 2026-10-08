import { formatAgeRange } from "./age-display.ts";
import type { Language } from "./catalog-i18n.ts";
import { isStorageImagePath } from "./product-admin-model.ts";
import {
  createEmptyTranslation,
  sortManagedProducts,
  type ManagedProduct,
  type ProductRecord,
  type ProductTranslation,
} from "./product-record.ts";
import { productIllustrations, type ProductIllustration, type ProductImageItem, type ProductVariant } from "./products.ts";

/**
 * Penerjemah data Supabase (bentuk relasional) menjadi tipe aplikasi.
 *
 * Modul ini murni - tanpa impor klien Supabase - supaya bisa diuji langsung
 * di Node dan dipakai ulang oleh lapisan baca publik maupun panel admin.
 */

/** Nama kolom yang diambil dari Supabase, satu kueri per daftar (tanpa N+1). */
export const PRODUCT_SELECT = [
  "id",
  "slug",
  "status",
  "sort_order",
  "surface",
  "accent",
  "illustration",
  "updated_at",
  "translations:product_translations(language_id, name, description, dimensions, contents, care)",
  "categories:product_categories(is_primary, category:categories(slug, translations:category_translations(language_id, name)))",
  "ages:product_age_ranges(age_range:age_ranges(min_months, max_months))",
  "images:product_images(id, storage_path, alt_text, sort_order, is_primary)",
  "material:material_id(code, translations:material_translations(language_id, name))",
  "finishing:finishing_id(code, translations:finishing_translations(language_id, name))",
  "variants:product_variants(id, code, sort_order, is_active, translations:product_variant_translations(language_id, name), prices:product_variant_prices(price, price_note, is_active, currency:currencies(code, symbol)))",
].join(", ");

type NameRow = { language_id: string; name: string };

export type SupabaseProductRow = {
  id: number | string;
  slug: string;
  status: "draft" | "published";
  sort_order: number;
  surface: string;
  accent: string;
  illustration: string;
  translations:
    | Array<{
        language_id: string;
        name: string;
        description: string;
        dimensions: string;
        contents: string;
        care: string;
      }>
    | null;
  categories:
    | Array<{
        is_primary: boolean;
        category: { slug: string; translations: NameRow[] | null } | null;
      }>
    | null;
  ages: Array<{ age_range: { min_months: number; max_months: number } | null }> | null;
  images: Array<{ id: number; storage_path: string; alt_text: string | null; sort_order: number; is_primary: boolean }> | null;
  material: { code: string | null; translations: NameRow[] | null } | null;
  finishing: { code: string | null; translations: NameRow[] | null } | null;
  variants:
    | Array<{
        id: number;
        code: string;
        sort_order: number;
        is_active: boolean;
        translations: NameRow[] | null;
        prices:
          | Array<{
              price: number | null;
              price_note: string;
              is_active: boolean;
              currency: { code: string; symbol: string } | null;
            }>
          | null;
      }>
    | null;
};

/**
 * Ambil nama terjemahan untuk satu bahasa dengan rantai cadangan:
 * bahasa diminta -> bahasa Indonesia -> entri pertama yang ada.
 */
export function resolveTranslationName(rows: NameRow[] | null | undefined, language: string): string {
  if (!rows || rows.length === 0) return "";

  const exact = rows.find((row) => row.language_id === language);
  if (exact && exact.name) return exact.name;

  const indonesian = rows.find((row) => row.language_id === "id");
  if (indonesian && indonesian.name) return indonesian.name;

  return rows.find((row) => row.name)?.name ?? "";
}

/**
 * Teks harga untuk ditampilkan.
 *
 * Selama formulir admin masih memakai teks bebas, `price_note` yang dipakai
 * (mis. "10 pcs" dari "$4 / 10 pcs" yang ditulis admin lewat kolom harga).
 * Kolom angka `price` + `currency` disiapkan untuk masa depan.
 */
export function variantPriceText(
  price:
    | {
        price: number | null;
        price_note: string;
        is_active: boolean;
        currency: { code: string; symbol: string } | null;
      }
    | undefined,
): string {
  if (!price) return "";
  if (price.price_note && price.price_note.trim().length > 0) return price.price_note.trim();

  if (price.price !== null && price.price !== undefined) {
    const symbol = price.currency?.symbol ?? "";
    const value = Number(price.price);
    return `${symbol}${Number.isInteger(value) ? value : value.toFixed(2)}`;
  }

  return "";
}

/** Ubah baris varian menjadi bentuk yang dipakai UI (label + harga). */
export function mapVariantRows(
  rows: SupabaseProductRow["variants"],
  language: string,
): ProductVariant[] {
  return (rows ?? [])
    .filter((variant) => variant.is_active)
    .slice()
    .sort((first, second) => first.sort_order - second.sort_order || first.id - second.id)
    .map((variant) => ({
      label: resolveTranslationName(variant.translations, language) || variant.code,
      price: variantPriceText((variant.prices ?? []).find((price) => price.is_active)),
    }));
}

/** Pembentuk alamat gambar (disuntik dari luar supaya modul ini tetap murni). */
export type PublicUrlBuilder = (storagePath: string) => string;

/**
 * Ubah satu baris Supabase menjadi `ManagedProduct` (bentuk lengkap yang
 * dipakai panel admin dan halaman publik).
 *
 * Nama kategori/material/finishing/usia dirakit dari tabel relasional ke
 * dalam sembilan kolom teks per bahasa yang sudah dikenal UI - bentuk luar
 * aplikasi tidak berubah.
 */
export function toManagedProductFromRow(
  row: SupabaseProductRow,
  buildPublicUrl: PublicUrlBuilder,
): ManagedProduct {
  const findTranslation = (language: string) =>
    (row.translations ?? []).find((item) => item.language_id === language);

  const primaryCategory = (row.categories ?? []).find((item) => item.is_primary)?.category ?? null;

  const makeTranslation = (language: Language): ProductTranslation => {
    const translation = createEmptyTranslation();
    const stored = findTranslation(language);

    if (stored) {
      translation.name = stored.name ?? "";
      translation.description = stored.description ?? "";
      translation.dimensions = stored.dimensions ?? "";
      translation.contents = stored.contents ?? "";
      translation.care = stored.care ?? "";
    }

    translation.category = resolveTranslationName(primaryCategory?.translations ?? null, language);

    const age = (row.ages ?? [])[0]?.age_range;
    translation.age = age ? formatAgeRange(age.min_months, age.max_months, language) : "";

    translation.wood = resolveTranslationName(row.material?.translations ?? null, language);
    translation.finish = resolveTranslationName(row.finishing?.translations ?? null, language);

    return translation;
  };

  const images = (row.images ?? [])
    .slice()
    .sort(
      (first, second) =>
        Number(second.is_primary) - Number(first.is_primary) || first.sort_order - second.sort_order,
    );
  const primaryImage = images[0];
  const gallery: ProductImageItem[] = images.map((image) => ({
    imageUrl: buildPublicUrl(image.storage_path),
    ...(isStorageImagePath(image.storage_path) ? { imagePath: image.storage_path } : {}),
    sortOrder: Number(image.sort_order),
    isPrimary: image.is_primary,
  }));

  const imageUrl = primaryImage ? buildPublicUrl(primaryImage.storage_path) : undefined;
  const imagePath =
    primaryImage && isStorageImagePath(primaryImage.storage_path)
      ? primaryImage.storage_path
      : undefined;

  const illustration = (productIllustrations as readonly string[]).includes(row.illustration)
    ? (row.illustration as ProductIllustration)
    : "mainan";

  const record: ProductRecord = {
    id: Number(row.id),
    slug: row.slug,
    status: row.status,
    order: Number(row.sort_order),
    surface: row.surface,
    accent: row.accent,
    illustration,
    translations: {
      id: makeTranslation("id"),
      en: makeTranslation("en"),
      ar: makeTranslation("ar"),
    },
    ...(imageUrl ? { imageUrl } : {}),
    ...(imagePath ? { imagePath } : {}),
    ...(gallery.length > 0 ? { images: gallery } : {}),
    variants: mapVariantRows(row.variants, "id"),
  };

  return { documentId: String(row.id), ...record };
}

/** Ubah daftar baris menjadi daftar produk siap render, terurut seperti dulu. */
export function rowsToManagedProducts(
  rows: SupabaseProductRow[],
  buildPublicUrl: PublicUrlBuilder,
): ManagedProduct[] {
  return sortManagedProducts(rows.map((row) => toManagedProductFromRow(row, buildPublicUrl)));
}
