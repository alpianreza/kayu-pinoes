/**
 * Model murni galeri foto proses pembuatan - tanpa koneksi server data,
 * supaya bisa diuji langsung di Node seperti modul murni lain.
 */

/** Nama folder galeri di dalam bucket `produk`. */
export const GALLERY_FOLDER = "gallery";

/** Batas jumlah objek yang dibaca sekali jalan dari Storage. */
export const GALLERY_LIST_PAGE_SIZE = 100;

/**
 * Bentuk nama objek galeri: gallery/{stempel waktu}-{nama ramah}.{ekstensi}.
 *
 * Stempel waktu di depan membuat urutan nama = urutan unggah, jadi galeri
 * bisa diurutkan tanpa kolom tambahan di database.
 */
export function buildGalleryPath(fileName: string, timestamp: number): string {
  const rawExtension = fileName.includes(".") ? fileName.split(".").pop() : "";
  const extension = (rawExtension ?? "").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";

  const base = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return `${GALLERY_FOLDER}/${timestamp}-${base || "foto"}.${extension}`;
}

/**
 * Apakah nama objek ini foto galeri yang boleh tampil?
 *
 * Menyaring placeholder folder dan berkas non-gambar yang mungkin ada di
 * dalam folder galeri.
 */
export function isGalleryImageName(name: string): boolean {
  if (!name || name.startsWith(".")) return false;
  return /\.(jpe?g|png|webp|gif)$/i.test(name);
}

/** Urutkan nama berkas galeri: yang terbaru di depan. */
export function sortGalleryNames(names: string[]): string[] {
  return [...names].sort((first, second) => second.localeCompare(first, "en"));
}
