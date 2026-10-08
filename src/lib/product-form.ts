import { z } from "zod";

import type { Language } from "./catalog-i18n.ts";
import { productIllustrations, type ProductImageItem } from "./products.ts";
import {
  createEmptyTranslation,
  normalizeImages,
  type ManagedProduct,
  type ProductRecord,
  type ProductStatus,
  type ProductTranslation,
} from "./product-record.ts";

export type TranslationForm = ProductTranslation;

export type ProductForm = {
  id: string;
  /** Alamat halaman, mis. "stacking-rainbow". */
  slug: string;
  order: string;
  status: ProductStatus;
  surface: string;
  accent: string;
  illustration: ManagedProduct["illustration"];
  imageUrl: string;
  imagePath: string;
  /** Galeri foto produk; `isPrimary` menentukan gambar utama. */
  images: ProductImageItem[];
  /** Varian produk (mis. ukuran) - nama wajib, harga boleh kosong. */
  variants: Array<{ label: string; price: string }>;
  translations: Record<Language, TranslationForm>;
};

/**
 * Gambar utama dari daftar galeri: yang `isPrimary` (atau pertama bila tidak
 * ada), dipakai mengisi field `imageUrl`/`imagePath` lama yang masih dibaca
 * komponen dan fungsi simpan.
 */
export function primaryImageFromList(images: ProductImageItem[]): {
  imageUrl: string;
  imagePath: string;
} {
  const primary = images.find((image) => image.isPrimary) ?? images[0];
  if (!primary) return { imageUrl: "", imagePath: "" };

  return { imageUrl: primary.imageUrl, imagePath: primary.imagePath ?? "" };
}

export const TRANSLATION_FIELDS: Array<{
  key: keyof ProductTranslation;
  label: string;
  multiline?: boolean;
}> = [
  { key: "name", label: "Nama produk" },
  { key: "category", label: "Kategori" },
  { key: "age", label: "Untuk usia berapa" },
  { key: "description", label: "Deskripsi", multiline: true },
  { key: "wood", label: "Jenis kayu" },
  { key: "dimensions", label: "Ukuran" },
  { key: "finish", label: "Cat & lapisan" },
  { key: "contents", label: "Isi set" },
  { key: "care", label: "Perawatan", multiline: true },
];

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Ubah teks menjadi alamat halaman: huruf kecil, angka, dan tanda hubung saja.
 * Dipakai untuk menyarankan alamat dari nama produk.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toRecord(product: ManagedProduct): ProductRecord {
  return {
    id: product.id,
    surface: product.surface,
    accent: product.accent,
    illustration: product.illustration,
    translations: product.translations,
    status: product.status,
    order: product.order,
    ...(product.slug ? { slug: product.slug } : {}),
    ...(product.imageUrl ? { imageUrl: product.imageUrl } : {}),
    ...(product.imagePath ? { imagePath: product.imagePath } : {}),
    ...(product.variants?.length ? { variants: product.variants } : {}),
    ...(product.images?.length ? { images: product.images } : {}),
  };
}

export function displayName(product: ManagedProduct): string {
  const indonesian = product.translations?.id;
  const name = indonesian?.name?.trim();
  return name && name.length > 0 ? name : product.documentId;
}

export function createEmptyForm(existing: ManagedProduct[]): ProductForm {
  const nextId = existing.reduce((max, product) => Math.max(max, product.id), 0) + 1;
  const nextOrder = existing.reduce((max, product) => Math.max(max, product.order), 0) + 1;

  return {
    id: String(nextId),
    slug: "",
    order: String(nextOrder),
    status: "draft",
    surface: "#F9E2BE",
    accent: "#D88653",
    illustration: "mainan",
    imageUrl: "",
    imagePath: "",
    images: [],
    variants: [],
    translations: {
      id: createEmptyTranslation(),
      en: createEmptyTranslation(),
      ar: createEmptyTranslation(),
    },
  };
}

export function formFromProduct(product: ManagedProduct): ProductForm {
  const images = normalizeImages(product.images);
  const legacyImage =
    images.length === 0 && product.imageUrl
      ? [{
          imageUrl: product.imageUrl,
          ...(product.imagePath ? { imagePath: product.imagePath } : {}),
          sortOrder: 0,
          isPrimary: true,
        }]
      : images;
  const primary = primaryImageFromList(legacyImage);

  return {
    id: String(product.id),
    slug: product.slug ?? "",
    order: String(product.order),
    status: product.status,
    surface: product.surface,
    accent: product.accent,
    illustration: product.illustration,
    imageUrl: primary.imageUrl,
    imagePath: primary.imagePath,
    images: legacyImage,
    variants: (product.variants ?? []).map((variant) => ({ label: variant.label, price: variant.price })),
    translations: {
      id: { ...createEmptyTranslation(), ...product.translations.id },
      en: { ...createEmptyTranslation(), ...product.translations.en },
      ar: { ...createEmptyTranslation(), ...product.translations.ar },
    },
  };
}

export type ValidationOptions = {
  /** Nama dokumen yang sudah dipakai koleksi, untuk mencegah penimpaan tak sengaja. */
  existingDocumentIds?: readonly string[];
  /** Alamat halaman milik produk LAIN, untuk mencegah dua produk punya alamat sama. */
  otherSlugs?: readonly string[];
  /** Saat mengedit, `id` memang tidak bisa diubah sehingga tidak perlu dicek. */
  isEditing?: boolean;
};

/**
 * Skema validasi formulir produk - SATU-SATUNYA sumber aturan bentuk data.
 *
 * Dulu pemeriksaan ditulis sebagai rangkaian `if` manual di validateForm;
 * sekarang Zod yang memegang aturan, sehingga:
 *   - panel admin bisa memakainya lewat zodResolver (pesan muncul per kolom),
 *   - validateForm lama tetap tersedia (mengembalikan daftar pesan) untuk
 *     jalur simpan,
 *   - tes menguji skema yang sama dengan yang dipakai UI.
 *
 * Aturan yang bergantung koleksi (ID/alamat sudah dipakai?) masuk sebagai
 * superRefine lewat options, karena hanya pemanggil yang tahu isi koleksinya.
 * Validasi KEAMANAN tetap di firestore.rules - ini hanya penjaga kenyamanan.
 */
const translationShape = {
  name: z.string(),
  category: z.string(),
  age: z.string(),
  description: z.string(),
  wood: z.string(),
  dimensions: z.string(),
  finish: z.string(),
  contents: z.string(),
  care: z.string(),
};

const productFormBase = z.object({
  id: z.string(),
  slug: z.string(),
  order: z.string(),
  status: z.enum(["draft", "published"]),
  surface: z.string(),
  accent: z.string(),
  // Enum, bukan string bebas: kunci ilustrasi yang tidak dikenal ToyArtwork
  // mustahil lolos validasi - sama ketatnya dengan isIllustration() di
  // firestore.rules.
  illustration: z.enum(productIllustrations),
  imageUrl: z.string(),
  imagePath: z.string(),
  images: z.array(z.object({
    imageUrl: z.string(),
    imagePath: z.string().optional(),
    sortOrder: z.number(),
    isPrimary: z.boolean(),
  })),
  variants: z.array(z.object({ label: z.string(), price: z.string() })),
  translations: z.object({
    id: z.object(translationShape),
    en: z.object(translationShape),
    ar: z.object(translationShape),
  }),
});

export function productFormSchema(options: ValidationOptions = {}) {
  return productFormBase.superRefine((form, context) => {
    const id = Number(form.id);

    if (!Number.isInteger(id) || id < 1) {
      context.addIssue({
        code: "custom",
        path: ["id"],
        message: "Nomor produk harus angka, minimal 1.",
      });
    } else if (!options.isEditing && options.existingDocumentIds?.includes(String(id))) {
      context.addIssue({
        code: "custom",
        path: ["id"],
        message: `Nomor ${id} sudah dipakai produk lain. Pakai nomor lain supaya produk yang sudah ada tidak tertimpa.`,
      });
    }

    const slug = form.slug.trim();

    if (slug.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["slug"],
        message: "Alamat halaman wajib diisi, misalnya stacking-rainbow.",
      });
    } else if (!SLUG_PATTERN.test(slug)) {
      context.addIssue({
        code: "custom",
        path: ["slug"],
        message:
          "Alamat halaman hanya boleh huruf kecil, angka, dan tanda hubung — tanpa spasi. Contoh: stacking-rainbow.",
      });
    } else if (options.otherSlugs?.includes(slug)) {
      context.addIssue({
        code: "custom",
        path: ["slug"],
        message: `Alamat "${slug}" sudah dipakai produk lain. Pakai alamat yang berbeda.`,
      });
    }

    if (!Number.isFinite(Number(form.order))) {
      context.addIssue({ code: "custom", path: ["order"], message: "Posisi tampil harus angka." });
    }

    if (!HEX_COLOR.test(form.surface.trim())) {
      context.addIssue({
        code: "custom",
        path: ["surface"],
        message: "Warna latar belum sesuai. Klik kotak warna di bawah untuk memilih.",
      });
    }

    if (!HEX_COLOR.test(form.accent.trim())) {
      context.addIssue({
        code: "custom",
        path: ["accent"],
        message: "Warna aksen belum sesuai. Klik kotak warna di bawah untuk memilih.",
      });
    }

    // Satu baris varian tanpa nama bikin pembeli tidak tahu bedanya - tolak
    // di sini alih-alih menampilkan baris kosong di halaman publik.
    form.variants.forEach((variant, index) => {
      if (!variant.label.trim()) {
        context.addIssue({
          code: "custom",
          path: ["variants", index, "label"],
          message: `Varian baris ${index + 1} belum diberi nama.`,
        });
      }
    });

    const languages = Object.keys(form.translations) as Language[];

    for (const language of languages) {
      if (!form.translations[language].name.trim()) {
        context.addIssue({
          code: "custom",
          path: ["translations", language, "name"],
          message: `Nama produk untuk bahasa ${language.toUpperCase()} wajib diisi.`,
        });
      }
    }
  });
}

export function validateForm(form: ProductForm, options: ValidationOptions = {}): string[] {
  const result = productFormSchema(options).safeParse(form);
  return result.error ? result.error.issues.map((issue) => issue.message) : [];
}

export function formToRecord(form: ProductForm): ProductRecord {
  const images = normalizeImages(form.images).map((image, index) => ({
    ...image,
    sortOrder: index,
  }));
  const primary = primaryImageFromList(images);

  return {
    id: Number(form.id),
    order: Number(form.order),
    status: form.status,
    surface: form.surface.trim(),
    accent: form.accent.trim(),
    illustration: form.illustration,
    ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
    ...(primary.imageUrl ? { imageUrl: primary.imageUrl } : {}),
    ...(primary.imagePath ? { imagePath: primary.imagePath } : {}),
    ...(images.length > 0 ? { images } : {}),
    ...(form.variants.length > 0
      ? {
          variants: form.variants.map((variant) => ({
            label: variant.label.trim(),
            price: variant.price.trim(),
          })),
        }
      : {}),
    translations: {
      id: { ...form.translations.id },
      en: { ...form.translations.en },
      ar: { ...form.translations.ar },
    },
  };
}

export function sortByOrderForDisplay(products: ManagedProduct[]): ManagedProduct[] {
  return [...products].sort((first, second) => first.order - second.order || first.id - second.id);
}

/**
 * Apakah isi form sudah berbeda dari nilai awal (deteksi "perubahan belum
 * disimpan"). Dipakai untuk menentukan apakah dialog konfirmasi perlu
 * ditampilkan saat editor ditutup.
 */
export function isFormDirty(current: ProductForm, initial: ProductForm): boolean {
  return JSON.stringify(normalizeForDirtyCheck(current)) !== JSON.stringify(normalizeForDirtyCheck(initial));
}

function normalizeForDirtyCheck(form: ProductForm): ProductForm {
  return {
    ...form,
    variants: [...form.variants].sort((a, b) => a.label.localeCompare(b.label)),
    images: form.images.map((image, index) => ({ ...image, sortOrder: index })),
    translations: {
      id: { ...form.translations.id },
      en: { ...form.translations.en },
      ar: { ...form.translations.ar },
    },
  };
}

/**
 * Apakah aksi yang sedang berjalan berlaku untuk baris ini?
 *
 * Penanda aksi disimpan sebagai `jenis:documentId`. Pencocokan sebelumnya
 * memakai `endsWith(documentId)` sehingga documentId "1" ikut cocok dengan
 * penanda untuk documentId "11". Pencocokan sekarang memakai pemisahnya.
 */
export function isBusyFor(busyAction: string | null, documentId: string): boolean {
  if (!busyAction) return false;
  return busyAction.endsWith(`:${documentId}`);
}
export function toMessage(error: unknown): string {
  const fallback = "Terjadi kesalahan yang tidak diketahui.";

  if (!error || typeof error !== "object") return fallback;

  const candidate = error as { code?: unknown; message?: unknown };
  const code = typeof candidate.code === "string" ? candidate.code : "";
  const message = typeof candidate.message === "string" ? candidate.message : "";

  if (code === "permission-denied" || code === "42501") {
    return "Akses menyimpan ditolak. Pastikan kamu masuk dengan akun admin dan kebijakan Row Level Security (RLS) di Supabase sudah aktif untuk tabel terkait.";
  }
  if (code === "auth/configuration-not-found" || code === "CONFIGURATION_NOT_FOUND") {
    return "Metode masuk email belum diaktifkan. Buka konsol Supabase → Authentication, lalu aktifkan penyedia Email.";
  }
  if (code === "auth/network-request-failed") {
    return "Tidak bisa menghubungi server. Cek koneksi internetmu, lalu coba lagi.";
  }
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return "Email atau kata sandi salah.";
  }
  if (code === "auth/invalid-email") return "Email belum benar formatnya (contoh: nama@surel.com).";
  if (code === "auth/too-many-requests") return "Terlalu sering mencoba masuk. Tunggu sebentar, lalu coba lagi.";
  if (code === "auth/operation-not-allowed") {
    return "Masuk dengan email belum diaktifkan. Buka konsol Supabase → Authentication dan aktifkan penyedia Email.";
  }
  if (code === "storage/bucket-not-found" || code === "storage/unknown") {
    return "Bucket penyimpanan Supabase belum siap. Pastikan bucket foto produk tersedia dan kebijakan storage mengizinkan admin untuk mengunggah.";
  }
  if (code === "storage/unauthorized") {
    return "Foto ditolak server. Pastikan kamu sudah masuk sebagai admin, filenya gambar, dan ukurannya tidak lebih dari 5 MB.";
  }
  if (code === "storage/retry-limit-exceeded") return "Foto gagal terunggah atau terlalu lama. Cek koneksi lalu ulangi.";
  if (code === "unavailable") return "Server sedang tidak bisa dihubungi. Cek koneksi internetmu.";

  return message || code || fallback;
}
