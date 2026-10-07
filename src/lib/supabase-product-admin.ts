import { isStorageImagePath, productDocumentId } from "./product-admin-model.ts";
import type { ManagedProduct, ProductRecord } from "./product-record.ts";
import { PRODUCT_IMAGE_BUCKET, productImageUrl, supabaseClient } from "./supabase.ts";

export { createEmptyTranslation } from "./product-record.ts";
export { isStorageImagePath, productDocumentId, stripDocumentId } from "./product-admin-model.ts";

/** Batas ukuran gambar produk. Harus konsisten dengan policy bucket "produk". */
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;

const NOT_CONNECTED_MESSAGE =
  "Situs belum tersambung ke server data. Isi berkas .env.local, lalu jalankan ulang servernya.";

function requireClient() {
  const client = supabaseClient();
  if (!client) throw new Error(NOT_CONNECTED_MESSAGE);
  return client;
}

function toError(error: { message?: string } | null): Error {
  return new Error(error?.message || "Terjadi kesalahan tak terduga pada server data.");
}

/**
 * Apakah baris produk sudah ada di database?
 *
 * Dipakai sebelum menimpa saat "edit": menyimpan memakai upsert, sehingga
 * produk yang terhapus di perangkat lain bisa hidup lagi bila tidak dicek.
 */
export async function productDocumentExists(documentId: string): Promise<boolean> {
  const numericId = Number(documentId);
  if (!Number.isFinite(numericId)) return false;

  const { data, error } = await requireClient()
    .from("products")
    .select("id")
    .eq("id", numericId)
    .maybeSingle();

  if (error) throw toError(error);
  return Boolean(data);
}

/**
 * Simpan (buat atau ganti) satu produk lengkap.
 *
 * Seluruh penulisan dijalankan oleh fungsi database `upsert_product` dalam
 * SATU transaksi: baris produk, terjemahan, kategori, usia, material,
 * finishing, foto, dan varian tidak bisa berakhir setengah-tersimpan.
 */
export async function saveProductRecord(record: ProductRecord): Promise<string> {
  const client = requireClient();

  const { error } = await client.rpc("upsert_product", { payload: record });
  if (error) throw toError(error);

  return productDocumentId(record.id);
}

export async function deleteProductRecord(documentId: string): Promise<void> {
  const client = requireClient();

  const { error } = await client.rpc("delete_product", { p_id: Number(documentId) });
  if (error) throw toError(error);
}

/** Tukar nilai urutan dua produk dalam satu transaksi database. */
export async function swapProductOrder(
  first: ManagedProduct,
  second: ManagedProduct,
): Promise<void> {
  const client = requireClient();

  const { error } = await client.rpc("swap_product_order", {
    p_first: Number(first.documentId),
    p_second: Number(second.documentId),
  });
  if (error) throw toError(error);
}

/**
 * Hapus satu berkas gambar dari Storage.
 *
 * Path yang bukan hasil unggahan aplikasi ini dilewati (`isStorageImagePath`),
 * supaya path di folder public atau URL luar tidak ikut tersentuh.
 *
 * Gagal hapus TIDAK dianggap galat penyimpanan: berkas yatim hanya memakan
 * kuota, sedangkan membatalkan operasi utama karena pembersihan gagal justru
 * membuat admin mengira datanya tidak tersimpan. Galatnya dicatat ke konsol.
 */
export async function deleteProductImage(imagePath: string): Promise<boolean> {
  if (!isStorageImagePath(imagePath)) return false;

  const client = supabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.storage.from(PRODUCT_IMAGE_BUCKET).remove([imagePath]);
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn("Gambar lama tidak berhasil dihapus:", imagePath, error);
    return false;
  }
}

/**
 * Unggah gambar produk ke bucket "produk". Path mengikuti pola yang sama
 * dengan versi lama: products/{documentId}-{waktu}.{ekstensi}.
 *
 * Berkas lama TIDAK dihapus di sini: produk masih menunjuk ke sana sampai
 * disimpan, jadi penghapusannya dikoordinasi pemanggil
 * (lihat `deleteProductImage`).
 */
export async function uploadProductImage(
  documentId: string,
  file: File,
): Promise<{ imageUrl: string; imagePath: string }> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Berkas harus berupa gambar (JPG, PNG, WebP, atau GIF).");
  }

  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error("Ukuran gambar maksimal 5 MB.");
  }

  const client = requireClient();

  const rawExtension = file.name.includes(".") ? file.name.split(".").pop() : "";
  const extension = (rawExtension ?? "").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const imagePath = `products/${documentId}-${Date.now()}.${extension}`;

  const { error } = await client.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(imagePath, file, { contentType: file.type, upsert: false });

  if (error) throw toError(error);

  return { imageUrl: productImageUrl(imagePath), imagePath };
}
