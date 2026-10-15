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

export const GALLERY_TABLE = "gallery_photos";

export type GalleryPhoto = {
  id: number;
  /** Path objek di bucket, mis. "gallery/1791750000000-proses-kayu.webp". */
  path: string;
  /** Alamat publik siap tampil. */
  imageUrl: string;
  /** Keterangan foto; kosong bila belum diisi. */
  caption: string;
};

type GalleryRow = { id: number | string; storage_path: string; caption: string | null };

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

/** Tabel galeri belum terpasang? (migrasi 008 belum dijalankan) */
function isMissingTableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /gallery_photos|does not exist|42P01/i.test(message);
}

function rowToPhoto(row: GalleryRow): GalleryPhoto {
  const path = String(row.storage_path);
  return {
    id: Number(row.id),
    path,
    imageUrl: productImageUrl(path),
    caption: String(row.caption ?? "").trim(),
  };
}

/**
 * Daftar foto galeri, yang terbaru di depan.
 *
 * Utamakan tabel `gallery_photos` (datanya: keterangan & waktu unggah). Bila
 * tabel belum terpasang (migrasi 008 belum dijalankan), jatuh ke pembacaan
 * folder `gallery/` di Storage langsung - tanpa keterangan - supaya foto
 * tetap tampil.
 */
export async function fetchGalleryPhotos(): Promise<GalleryPhoto[]> {
  if (!isSupabaseConfigured) return [];

  const client = requireClient();

  try {
    const { data, error } = await client
      .from(GALLERY_TABLE)
      .select("id, storage_path, caption")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (error) throw toError(error);

    const rows = (data ?? []) as GalleryRow[];
    return rows.map(rowToPhoto);
  } catch (error) {
    if (!isMissingTableError(error)) throw error;
    // Tabel belum ada: tampilkan foto dari Storage tanpa keterangan.
    return fetchGalleryPhotosFromStorage(client);
  }
}

/** Versi admin: galat dilempar apa adanya (termasuk tabel yang belum ada). */
export async function fetchAdminGalleryPhotos(): Promise<GalleryPhoto[]> {
  const client = requireClient();

  const { data, error } = await client
    .from(GALLERY_TABLE)
    .select("id, storage_path, caption")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw toError(error);

  const rows = (data ?? []) as GalleryRow[];
  return rows.map(rowToPhoto);
}

/** Cadangan: baca isi folder `gallery/` langsung dari Storage. */
async function fetchGalleryPhotosFromStorage(
  client: NonNullable<ReturnType<typeof supabaseClient>>,
): Promise<GalleryPhoto[]> {
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
    return { id: -1, path, imageUrl: productImageUrl(path), caption: "" };
  });
}

/**
 * Unggah satu foto galeri (khusus admin - dijaga policy Storage).
 *
 * Dua langkah: unggah berkas ke Storage, lalu simpan barisnya (keterangan
 * bisa ditulis kemudian dari panel). Bila baris gagal tersimpan, berkasnya
 * ikut dibersihkan supaya tidak jadi yatim.
 */
export async function uploadGalleryPhoto(file: File, caption = ""): Promise<GalleryPhoto> {
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

  const { error: insertError } = await client
    .from(GALLERY_TABLE)
    .insert({ storage_path: path, caption: caption.trim() });

  if (insertError) {
    try {
      await client.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
    } catch (cleanupError) {
      console.warn("Foto galeri yatim tidak berhasil dihapus:", path, cleanupError);
    }
    throw toError(insertError);
  }

  return { id: -1, path, imageUrl: productImageUrl(path), caption: caption.trim() };
}

/** Hapus satu foto galeri (khusus admin): barisnya dulu, berkasnya menyusul. */
export async function deleteGalleryPhoto(photo: GalleryPhoto): Promise<void> {
  const client = requireClient();

  const { error } = await client.from(GALLERY_TABLE).delete().eq("id", photo.id);
  if (error) throw toError(error);

  try {
    await client.storage.from(PRODUCT_IMAGE_BUCKET).remove([photo.path]);
  } catch (error) {
    console.warn("Berkas galeri tidak berhasil dihapus:", photo.path, error);
  }
}

/** Simpan keterangan satu foto galeri (khusus admin). */
export async function updateGalleryCaption(id: number, caption: string): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from(GALLERY_TABLE)
    .update({ caption: caption.trim() })
    .eq("id", id);
  if (error) throw toError(error);
}
