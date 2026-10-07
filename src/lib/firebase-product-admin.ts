import { deleteDoc, doc, getDoc, setDoc, writeBatch } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { firebaseDb, firebaseStorage } from "@/lib/firebase";
import { PRODUCT_COLLECTION } from "./firebase-products.ts";
import {
  isStorageImagePath,
  productDocumentId,
  stripDocumentId,
} from "./product-admin-model.ts";
import type { ManagedProduct, ProductRecord } from "./product-record.ts";

export { createEmptyTranslation } from "./product-record.ts";
export { isStorageImagePath, productDocumentId, stripDocumentId } from "./product-admin-model.ts";

/** Batas ukuran gambar produk. Harus konsisten dengan storage.rules. */
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;

function requireDb() {
  if (!firebaseDb) {
    throw new Error(
      "Situs belum tersambung ke server data. Isi berkas .env.local, lalu jalankan ulang servernya.",
    );
  }
  return firebaseDb;
}

function requireStorage() {
  if (!firebaseStorage) {
    throw new Error(
      "Penyimpanan foto belum tersambung ke situs. Isi berkas .env.local, lalu jalankan ulang servernya.",
    );
  }
  return firebaseStorage;
}

/**
 * Apakah dokumen produk sudah ada di Firestore?
 *
 * Dipakai sebelum menimpa dokumen saat "edit". Panel admin menyimpan dengan
 * `setDoc(..., { merge: false })`, yang membuat dokumen baru bila document ID
 * belum ada. Tanpa pemeriksaan ini, produk yang terhapus di perangkat lain
 * akan hidup lagi dengan isi form yang masih terbuka di layar.
 */
export async function productDocumentExists(documentId: string): Promise<boolean> {
  const snapshot = await getDoc(doc(requireDb(), PRODUCT_COLLECTION, documentId));
  return snapshot.exists();
}

/** Tulis (create atau replace) satu dokumen produk. Document ID = string dari `id`. */
export async function saveProductRecord(record: ProductRecord): Promise<string> {
  const db = requireDb();
  const documentId = productDocumentId(record.id);
  await setDoc(doc(db, PRODUCT_COLLECTION, documentId), record, { merge: false });
  return documentId;
}

export async function deleteProductRecord(documentId: string): Promise<void> {
  const db = requireDb();
  await deleteDoc(doc(db, PRODUCT_COLLECTION, documentId));
}

/**
 * Tukar nilai `order` dua produk dalam satu batch atomik.
 * Sebelumnya dua penulisan terpisah; bila yang kedua gagal, dua dokumen
 * berakhir dengan `order` yang sama.
 */
export async function swapProductOrder(
  first: ManagedProduct,
  second: ManagedProduct,
): Promise<void> {
  const db = requireDb();
  const batch = writeBatch(db);

  batch.set(doc(db, PRODUCT_COLLECTION, first.documentId), {
    ...stripDocumentId(first),
    order: second.order,
  });
  batch.set(doc(db, PRODUCT_COLLECTION, second.documentId), {
    ...stripDocumentId(second),
    order: first.order,
  });

  await batch.commit();
}

/**
 * Hapus satu berkas gambar dari Storage.
 *
 * Path yang bukan hasil unggahan aplikasi ini dilewati (`isStorageImagePath`),
 * supaya URL luar atau path di folder public tidak ikut tersentuh.
 *
 * Gagal hapus TIDAK dianggap galat penyimpanan: berkas yatim hanya memakan
 * kuota, sedangkan membatalkan operasi utama karena pembersihan gagal justru
 * membuat admin mengira datanya tidak tersimpan. Galatnya dicatat ke konsol.
 */
export async function deleteProductImage(imagePath: string): Promise<boolean> {
  if (!isStorageImagePath(imagePath)) return false;
  if (!firebaseStorage) return false;

  try {
    await deleteObject(ref(firebaseStorage, imagePath));
    return true;
  } catch (error) {
    console.warn("Gambar lama tidak berhasil dihapus:", imagePath, error);
    return false;
  }
}

/**
 * Unggah gambar produk ke Storage. Path mengikuti storage.rules:
 * products/{fileName}.
 *
 * Berkas lama TIDAK dihapus di sini: dokumen masih menunjuk ke sana sampai
 * produk disimpan, jadi penghapusannya dikoordinasi pemanggil
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

  const storage = requireStorage();
  const rawExtension = file.name.includes(".") ? file.name.split(".").pop() : "";
  const extension = (rawExtension ?? "").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const imagePath = `products/${documentId}-${Date.now()}.${extension}`;
  const imageRef = ref(storage, imagePath);

  await uploadBytes(imageRef, file, { contentType: file.type });

  return { imageUrl: await getDownloadURL(imageRef), imagePath };
}
