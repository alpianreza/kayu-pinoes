import { getLocalizedProducts, type Language } from "./catalog-i18n.ts";
import {
  productIllustrations,
  staticProductImage,
  staticProductSlug,
  type Product,
  type ProductIllustration,
  type ProductVariant,
} from "./products.ts";

export type ProductTranslation = Pick<
  Product,
  "name" | "category" | "age" | "description" | "wood" | "dimensions" | "finish" | "contents" | "care"
>;

export const TRANSLATION_KEYS = [
  "name",
  "category",
  "age",
  "description",
  "wood",
  "dimensions",
  "finish",
  "contents",
  "care",
] as const satisfies ReadonlyArray<keyof ProductTranslation>;

export type ProductStatus = "draft" | "published";

export type ProductRecord = {
  id: number;
  /** Alamat halaman. Opsional supaya dokumen lama tetap sah. */
  slug?: string;
  surface: string;
  accent: string;
  illustration: ProductIllustration;
  translations: Record<Language, ProductTranslation>;
  imageUrl?: string;
  imagePath?: string;
  /** Daftar varian dengan harga opsional. Opsional supaya dokumen lama tetap sah. */
  variants?: ProductVariant[];
  status: ProductStatus;
  order: number;
};

export type ManagedProduct = ProductRecord & {
  documentId: string;
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function createEmptyTranslation(): ProductTranslation {
  return {
    name: "",
    category: "",
    age: "",
    description: "",
    wood: "",
    dimensions: "",
    finish: "",
    contents: "",
    care: "",
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidTranslation(value: unknown): value is ProductTranslation {
  if (!isPlainObject(value)) return false;

  return TRANSLATION_KEYS.every((key) => typeof value[key] === "string");
}

/**
 * Saring daftar varian agar aman dirender: baris yang bentuknya cacat (bukan
 * objek, atau labelnya kosong) dibuang - bukan menjatuhkan seluruh produk.
 */
export function normalizeVariants(value: unknown): ProductVariant[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!isPlainObject(item)) return [];

    const label = typeof item.label === "string" ? item.label.trim() : "";
    const price = typeof item.price === "string" ? item.price.trim() : "";

    return label.length > 0 ? [{ label, price }] : [];
  });
}

/**
 * Validasi runtime dokumen Firestore.
 *
 * Dokumen bisa dibuat dari Console, oleh versi UI yang lebih lama, atau saat
 * skema berubah. Sebelumnya data dipercaya lewat `as ProductRecord`, sehingga
 * dokumen cacat langsung merusak tampilan. Sekarang dokumen yang tidak lolos
 * validasi dilewati saja, bukan dirender.
 */
export function isValidProductRecord(value: unknown): value is ProductRecord {
  if (!isPlainObject(value)) return false;

  if (typeof value.id !== "number" || !Number.isInteger(value.id) || value.id < 1) return false;
  if (typeof value.surface !== "string" || !HEX_COLOR.test(value.surface)) return false;
  if (typeof value.accent !== "string" || !HEX_COLOR.test(value.accent)) return false;
  if (typeof value.order !== "number" || !Number.isFinite(value.order)) return false;
  if (value.status !== "draft" && value.status !== "published") return false;
  if (typeof value.illustration !== "string") return false;
  if (!productIllustrations.includes(value.illustration as (typeof productIllustrations)[number])) return false;

  if (!isPlainObject(value.translations)) return false;
  if (!isValidTranslation(value.translations.id)) return false;

  if (
    value.slug !== undefined &&
    (typeof value.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug))
  ) {
    return false;
  }

  if (value.imageUrl !== undefined && typeof value.imageUrl !== "string") return false;
  if (value.imagePath !== undefined && typeof value.imagePath !== "string") return false;

  // Varian cukup dicek bentuk daftarnya; baris yang cacat disaring oleh
  // normalizeVariants supaya satu baris rusak tidak menjatuhkan produk.
  if (value.variants !== undefined && !Array.isArray(value.variants)) return false;

  return true;
}

export function toManagedProduct(documentId: string, data: unknown): ManagedProduct | null {
  if (!isValidProductRecord(data)) return null;
  return { documentId, ...data };
}

function readTranslation(
  product: ProductRecord,
  language: Language,
): ProductTranslation | null {
  const translations = product.translations ?? ({} as Record<Language, ProductTranslation>);
  const candidates = [translations[language], translations.id];

  for (const candidate of candidates) {
    if (isValidTranslation(candidate) && candidate.name.trim().length > 0) {
      return candidate;
    }
  }

  return null;
}

/**
 * Ubah satu dokumen Firestore menjadi `Product` siap render.
 *
 * Fallback berlapis: bahasa yang diminta -> bahasa Indonesia -> katalog statis
 * (berdasarkan `id`) -> terjemahan kosong. Dengan begitu kartu produk tidak
 * pernah kehilangan nama maupun deskripsi.
 */
export function getLocalizedProduct(product: ProductRecord, language: Language): Product {
  const translation = readTranslation(product, language);

  if (translation) {
    return {
      id: product.id,
      slug: product.slug ?? staticProductSlug(product.id) ?? String(product.id),
      ...translation,
      surface: product.surface,
      accent: product.accent,
      illustration: product.illustration,
      imageUrl: product.imageUrl ?? staticProductImage(product.id),
      variants: normalizeVariants(product.variants),
    };
  }

  const staticProduct = getLocalizedProducts(language).find((item) => item.id === product.id);

  if (staticProduct) {
    return {
      ...staticProduct,
      surface: product.surface || staticProduct.surface,
      accent: product.accent || staticProduct.accent,
      illustration: product.illustration ?? staticProduct.illustration,
      imageUrl: product.imageUrl ?? staticProduct.imageUrl,
      variants: normalizeVariants(product.variants),
    };
  }

  return {
    id: product.id,
    slug: product.slug ?? staticProductSlug(product.id) ?? String(product.id),
    ...createEmptyTranslation(),
    surface: product.surface,
    accent: product.accent,
    illustration: product.illustration,
    imageUrl: product.imageUrl ?? staticProductImage(product.id),
    variants: normalizeVariants(product.variants),
  };
}

export function sortManagedProducts(products: ManagedProduct[]): ManagedProduct[] {
  return [...products].sort((first, second) => first.order - second.order || first.id - second.id);
}
