import type { ManagedProduct, ProductRecord } from "./product-record.ts";

/**
 * Bagian murni dari lapisan admin produk - tanpa koneksi Firebase - supaya
 * bisa diuji langsung (`firebase-product-admin.ts` mengimpor modul firebase
 * yang tidak bisa berjalan di Node).
 */

/** Document ID Firestore untuk satu ID produk: angka yang ditulis sebagai teks. */
export function productDocumentId(productId: number): string {
  return String(productId);
}

/**
 * Buang `documentId` ( metadata Firestore, bukan bagian dokumen ) dan simpan
 * SEMUA field data produk.
 *
 * Dulu fungsi ini menjatuhkan `slug`, sehingga menukar urutan produk lewat
 * batch write menghapus alamat halaman produk itu tanpa sengaja. Field baru
 * yang ditambahkan ke ProductRecord harus ikut di sini.
 */
export function stripDocumentId(product: ManagedProduct): ProductRecord {
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
  };
}

/**
 * Apakah imagePath menunjuk ke berkas hasil unggahan aplikasi ini?
 *
 * storage.rules hanya mengizinkan path `products/{nama}`; path lain (mis.
 * kosong, atau nilai manual admin) tidak boleh dicoba hapus.
 */
export function isStorageImagePath(imagePath: string | undefined | null): boolean {
  return Boolean(imagePath && /^products\/[^/]+$/.test(imagePath));
}
