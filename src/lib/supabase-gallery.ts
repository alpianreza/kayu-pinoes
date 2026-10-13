import {
  GALLERY_FOLDER,
  GALLERY_LIST_PAGE_SIZE,
  buildGalleryPath,
  isGalleryImageName,
  sortGalleryNames,
} from "./gallery-model.ts";
import { MAX_PRODUCT_IMAGE_BYTES } from "./supabase-product-admin.ts";
import {
  PRODUCT_IMAGE_BUCKET,
  isSupabaseConfigured,
  productImageUrl,
  supabaseClient,
} from "./supabase.ts";

export {
  GALLERY_FOLDER,
  buildGalleryPath,
  isGalleryImageName,
  sortGalleryNames,
} from "./gallery-model.ts";
export { MAX_PRODUCT_IMAGE_BYTES } from "./supabase-product-admin.ts";

export type GalleryPhoto = {
  /** Path objek di bucket, mis. "gallery/1791750000000-proses-kayu.webp". */
  path: string;
  /** Alamat publik siap tampil. */
  imageUrl: string;
};

function toError(error: { message?: string } | null): Error {
  return new Error(error?.message || "Terjadi kesalahan tak terduga pada server data.");
}

function requireClient() {
  const client = supabaseClient();
  if (!client) {
    throw new Error(
      "Situs belum tersambung ke server data. Isi berkas .env.local, lalu jalankan ulang servernya.",
    );
  }
  return client;
}

/**
 * Daftar foto galeri, yang terbaru di depan.
 *
 * Publik boleh membaca seluruh objek bucket `produk` (policy "produk foto
 * baca publik"), jadi halaman galeri cukup membaca isi folder `gallery/` -
 * tidak ada tabel terpisah yang perlu disinkronkan.
 */
export async function fetchGalleryPhotos(): Promise<GalleryPhoto[]> {
  if (!isSupabaseConfigured) return [];

  const client = requireClient();
  const names: string[] = [];

  for (let offset = 0; offset <= 10 * GALLERY_LIST_PAGE_SIZE; offset += GALLERY_LIST_PAGE_SIZE) {
    const { data, error } = await client.storage.from(PRODUCT_IMAGE_BUCKET).list(GALLERY_FOLDER, {
      limit: GALLERY_LIST_PAGE_SIZE,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) throw toError(error);

    const page = data ?? [];
    for (const item of page) {
      if (isGalleryImageName(item.name)) names.push(item.name);
    }

    if (page.length < GALLERY_LIST_PAGE_SIZE) break;
  }

  return sortGalleryNames(names).map((name) => {
    const path = `${GALLERY_FOLDER}/${name}`;
    return { path, imageUrl: productImageUrl(path) };
  });
}

/** Unggah satu foto galeri (khusus admin - dijaga policy Storage). */
export async function uploadGalleryPhoto(file: File): Promise<GalleryPhoto> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Berkas harus berupa gambar (JPG, PNG, WebP, atau GIF).");
  }

  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error("Ukuran foto maksimal 5 MB.");
  }

  const client = requireClient();
  const path = buildGalleryPath(file.name, Date.now());

  const { error } = await client.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw toError(error);

  return { path, imageUrl: productImageUrl(path) };
}

/** Hapus satu foto galeri (khusus admin - dijaga policy Storage). */
export async function deleteGalleryPhoto(path: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
  if (error) throw toError(error);
}
