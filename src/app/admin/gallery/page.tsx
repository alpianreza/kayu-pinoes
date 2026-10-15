"use client";

import { Camera, ExternalLink, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ProductImage } from "@/components/site/ProductImage";
import { Button } from "@/components/ui/button";
import { toMessage } from "@/lib/product-form";
import {
  MAX_PRODUCT_IMAGE_BYTES,
  deleteGalleryPhoto,
  fetchAdminGalleryPhotos,
  updateGalleryCaption,
  uploadGalleryPhoto,
  type GalleryPhoto,
} from "@/lib/supabase-gallery";

import { ConfirmModal } from "../_components/ConfirmModal";
import { Notice } from "../_components/Notice";
import { useToast } from "../_components/Toaster";

const MAX_PHOTO_MB = Math.round(MAX_PRODUCT_IMAGE_BYTES / (1024 * 1024));

/** Pesan ramah bila tabel galeri belum terpasang (migrasi 008 belum dijalankan). */
function ramahkanListError(message: string): string {
  if (/gallery_photos|does not exist|42P01/i.test(message)) {
    return "Tabel galeri belum terpasang. Jalankan berkas supabase/migrations/008_gallery_photos.sql di Supabase → SQL Editor, lalu muat ulang halaman ini.";
  }
  return message;
}

/**
 * Panel admin galeri: unggah foto, tulis keterangan per foto, hapus.
 *
 * Foto disimpan di bucket "produk" folder `gallery/`; keterangan dan
 * urutan tampilnya (terbaru di depan) disimpan di tabel `gallery_photos`.
 */
export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryPhoto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [captionDrafts, setCaptionDrafts] = useState<Record<number, string>>({});
  const [savingCaptionId, setSavingCaptionId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  const reload = useCallback(async () => {
    try {
      const next = await fetchAdminGalleryPhotos();
      setPhotos(next);
      setListError(null);
    } catch (error) {
      setListError(ramahkanListError(toMessage(error)));
    } finally {
      setLoaded(true);
    }
  }, []);

  // Muat sekali di awal. setState hanya dipanggil dari callback promise,
  // bukan sinkron di badan efek, supaya tidak memicu render bertingkat.
  useEffect(() => {
    let active = true;

    fetchAdminGalleryPhotos()
      .then((next) => {
        if (active) {
          setPhotos(next);
          setListError(null);
        }
      })
      .catch((error) => {
        if (active) setListError(ramahkanListError(toMessage(error)));
      })
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  function captionValue(photo: GalleryPhoto): string {
    return captionDrafts[photo.id] ?? photo.caption;
  }

  function captionChanged(photo: GalleryPhoto): boolean {
    return captionValue(photo).trim() !== photo.caption;
  }

  async function handleFilesChosen(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    const failedNames: string[] = [];

    for (const file of Array.from(files)) {
      try {
        await uploadGalleryPhoto(file);
        successCount += 1;
      } catch {
        failedNames.push(file.name);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (successCount > 0) {
      showToast("success", `${successCount} foto berhasil diunggah.`);
    }
    if (failedNames.length > 0) {
      showToast("error", `Gagal mengunggah: ${failedNames.join(", ")}`);
    }

    await reload();
  }

  async function handleCaptionSave(photo: GalleryPhoto) {
    const value = captionValue(photo).trim();
    setSavingCaptionId(photo.id);
    try {
      await updateGalleryCaption(photo.id, value);
      showToast("success", "Keterangan disimpan.");
      setCaptionDrafts((prev) => {
        const next = { ...prev };
        delete next[photo.id];
        return next;
      });
      await reload();
    } catch (error) {
      showToast("error", toMessage(error));
    } finally {
      setSavingCaptionId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteGalleryPhoto(deleteTarget);
      showToast("success", "Foto dihapus dari galeri.");
      setDeleteTarget(null);
      await reload();
    } catch (error) {
      showToast("error", toMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#C76845]">Galeri</span>
          <h1 className="font-display text-3xl tracking-[-0.05em] text-[#294332] sm:text-4xl">
            Foto Proses Pembuatan
          </h1>
          <p className="mt-1 text-sm text-[#6B766E]">
            Kumpulan foto bengkel dan proses pembuatan — tampil di halaman Galeri situs. Keterangan bisa ditulis per foto.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/gallery" target="_blank">
              <ExternalLink size={16} /> Lihat Halaman Galeri
            </Link>
          </Button>
          <Button disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} /> {uploading ? "Mengunggah…" : "Unggah Foto"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(event) => void handleFilesChosen(event.target.files)}
          />
        </div>
      </div>

      <p className="text-xs text-[#8A948C]">
        Foto terbaru tampil lebih dulu. Maksimal {MAX_PHOTO_MB} MB per foto (JPG, PNG, WebP, atau GIF). Klik foto pada pratinjau untuk melihat modal beserta keterangannya seperti di situs.
      </p>

      {listError ? <Notice kind="error">{listError}</Notice> : null}

      {!loaded ? (
        <p className="text-sm font-bold text-[#6B766E]">Memuat foto…</p>
      ) : photos.length === 0 ? (
        <div className="rounded-[1.7rem] border border-dashed border-[#314B3A]/20 bg-white p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#EEF1E9] text-[#456C4D]">
            <Camera size={22} />
          </span>
          <p className="font-display mt-4 text-2xl tracking-[-0.04em] text-[#334139]">Belum ada foto</p>
          <p className="mt-2 text-sm leading-6 text-[#6B766E]">
            Unggah foto pertama — misalnya saat memilih kayu atau menghaluskan mainan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <figure
              key={photo.id}
              className="overflow-hidden rounded-[1.25rem] border border-[#314B3A]/10 bg-white"
            >
              <div className="relative aspect-square">
                <ProductImage src={photo.imageUrl} alt="" sizes="(max-width: 640px) 50vw, 25vw" />
                <button
                  type="button"
                  aria-label="Hapus foto"
                  onClick={() => setDeleteTarget(photo)}
                  className="absolute end-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-[#1B241E]/70 text-white backdrop-blur-sm transition-colors hover:bg-[#C76845]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="space-y-2 p-3">
                <input
                  type="text"
                  value={captionValue(photo)}
                  onChange={(event) =>
                    setCaptionDrafts((prev) => ({ ...prev, [photo.id]: event.target.value }))
                  }
                  placeholder="Keterangan foto…"
                  className="w-full rounded-xl border border-[#314B3A]/15 bg-[#FBF9F3] px-3 py-2 text-xs font-semibold text-[#27372D] outline-none transition focus:border-[#C76845]/60"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  disabled={!captionChanged(photo) || savingCaptionId === photo.id}
                  onClick={() => void handleCaptionSave(photo)}
                >
                  {savingCaptionId === photo.id ? "Menyimpan…" : "Simpan keterangan"}
                </Button>
              </div>
            </figure>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Hapus foto ini?"
        description="Foto beserta keterangannya akan dihapus permanen dari galeri dan tidak bisa dikembalikan."
        confirmLabel={deleting ? "Menghapus…" : "Ya, hapus"}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
