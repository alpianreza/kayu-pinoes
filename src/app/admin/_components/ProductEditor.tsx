"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUp, X } from "lucide-react";
import { useMemo, useState, type ChangeEvent } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { ToyArtwork } from "@/components/site/ToyArtwork";
import { Button } from "@/components/ui/button";
import { languageOptions, type Language } from "@/lib/catalog-i18n";
import { MAX_PRODUCT_IMAGE_BYTES } from "@/lib/firebase-product-admin";
import {
  productIllustrationLabels,
  productIllustrations,
} from "@/lib/firebase-products";
import { type ProductRecord } from "@/lib/product-record";
import {
  TRANSLATION_FIELDS,
  formToRecord,
  productFormSchema,
  slugify,
  toMessage,
  type ProductForm,
  type ValidationOptions,
} from "@/lib/product-form";

import { Notice } from "./Notice";
import { TextField } from "./TextField";

/**
 * Formulir produk.
 *
 * Nilai isian dipegang react-hook-form (uncontrolled - satu ketikan tidak
 * me-render ulang seluruh panel), sementara ATURAN bentuknya adalah skema Zod
 * yang sama (`productFormSchema`) dengan yang dipakai validateForm saat
 * menyimpan. Pesan galat tampil di bawah kolom masing-masing.
 *
 * `initialForm` dibaca sekali saat komponen dibuka; panel ini memang
 * di-mount ulang setiap kali editor dibuka, jadi tidak ada nilai sisa dari
 * produk sebelumnya.
 */
export function ProductEditor({
  initialForm,
  validationOptions,
  editingDocumentId,
  saving,
  serverError,
  onUpload,
  onClose,
  onSubmit,
}: {
  initialForm: ProductForm;
  validationOptions: ValidationOptions;
  editingDocumentId: string | null;
  saving: boolean;
  serverError: string | null;
  onUpload: (idValue: string, file: File) => Promise<{ imageUrl: string; imagePath: string }>;
  onClose: () => void;
  onSubmit: (record: ProductRecord) => Promise<void>;
}) {
  const [formLanguage, setFormLanguage] = useState<Language>("id");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Options divalidasi ulang saat snapshot produk berubah (ID/alamat milik
  // produk lain bisa kapan saja bergeser saat editor masih terbuka).
  const schema = useMemo(() => productFormSchema(validationOptions), [validationOptions]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<ProductForm>({
    defaultValues: initialForm,
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  // Hanya field yang benar-benar mengubah tampilan panel yang di-watch;
  // kolom teks biasa dibiarkan tidak terkontrol demi performa mengetik.
  const surface = useWatch({ name: "surface", control });
  const accent = useWatch({ name: "accent", control });
  const illustration = useWatch({ name: "illustration", control });
  const idValue = useWatch({ name: "id", control });
  const imageUrl = useWatch({ name: "imageUrl", control });

  const documentId = idValue.trim();

  // Baris varian dikelola react-hook-form supaya menambah/menghapus baris
  // tidak mengacak nilai kolom lain.
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: "variants" });

  const save = handleSubmit((values) => onSubmit(formToRecord(values)));

  async function handleImageFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploaded = await onUpload(idValue, file);
      setValue("imageUrl", uploaded.imageUrl, { shouldDirty: true });
      setValue("imagePath", uploaded.imagePath, { shouldDirty: true });
    } catch (error) {
      setUploadError(toMessage(error));
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  function clearImage() {
    setValue("imageUrl", "", { shouldDirty: true });
    setValue("imagePath", "", { shouldDirty: true });
  }

  return (
    <section className="rounded-[2rem] border border-[#314B3A]/12 bg-white p-6 shadow-[0_18px_50px_rgba(49,75,58,0.08)] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="product-editor-title" className="font-display text-2xl tracking-[-0.045em] text-[#294332]">
            {editingDocumentId ? `Ubah produk nomor ${idValue}` : "Produk baru"}
          </h2>
          <p className="mt-1 text-sm text-[#6B766E]">
            Tersimpan dengan nomor{" "}
            <code className="rounded bg-[#F1EFE7] px-1.5 py-0.5 text-[13px]">
              {documentId || "(belum diisi)"}
            </code>
          </p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Tutup" onClick={onClose}>
          <X size={18} />
        </Button>
      </div>

      {serverError || uploadError ? (
        <div className="mt-5">
          <Notice kind="error">{serverError ?? uploadError}</Notice>
        </div>
      ) : null}

      <form onSubmit={save} noValidate>
        <div className="mt-6 rounded-2xl border border-[#314B3A]/12 bg-[#F7F5EE] p-4 sm:p-5">
          <TextField
            label="Alamat halaman"
            error={errors.slug?.message}
            hint={errors.slug ? undefined : "Alamat web produk ini, mis. namatoko.com/products/stacking-rainbow. Huruf kecil, angka, tanda hubung."}
            register={register}
            name="slug"
          />
          <Button
            className="mt-3"
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setValue("slug", slugify(getValues("translations.id.name")), { shouldDirty: true })}
          >
            Buat dari nama
          </Button>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <TextField
            label="Nomor produk"
            register={register}
            name="id"
            disabled={editingDocumentId !== null}
            error={errors.id?.message}
            hint={
              errors.id
                ? undefined
                : editingDocumentId !== null
                  ? "Nomor ini tidak bisa diubah lagi setelah produk tersimpan."
                  : "Pakai nomor yang belum dipakai produk lain."
            }
          />
          <TextField
            label="Urutan tampil"
            register={register}
            name="order"
            error={errors.order?.message}
            hint={errors.order ? undefined : "Angka lebih kecil tampil lebih dahulu."}
          />
          {/* Bukan <label>: isinya sekumpulan tombol pilihan, bukan satu isian. */}
          <div className="block">
            <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
              Status
            </span>
            <select
              className="w-full rounded-xl border border-[#314B3A]/15 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#27372D] outline-none transition focus:border-[#C76845] focus:ring-2 focus:ring-[#C76845]/25"
              {...register("status")}
            >
              <option value="draft">Disimpan saja — belum dilihat pembeli</option>
              <option value="published">Tampil di situs — dilihat pembeli</option>
            </select>
          </div>
          <div className="block">
            <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
              Ilustrasi
            </span>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5" role="group" aria-label="Ilustrasi">
              {productIllustrations.map((option) => {
                const selected = illustration === option;

                return (
                  <button
                    key={option}
                    aria-pressed={selected}
                    className={`rounded-2xl border p-1.5 text-center transition focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#C76845] ${
                      selected
                        ? "border-[#C76845] bg-[#F9E7DF] ring-2 ring-[#C76845]/25"
                        : "border-[#314B3A]/12 bg-white hover:border-[#314B3A]/30"
                    }`}
                    onClick={() => setValue("illustration", option, { shouldDirty: true })}
                    type="button"
                  >
                    <span
                      className="block aspect-square w-full overflow-hidden rounded-xl"
                      style={{ backgroundColor: surface }}
                    >
                      <ToyArtwork illustration={option} />
                    </span>
                    <span
                      className={`mt-1.5 block text-[11px] font-bold leading-tight ${
                        selected ? "text-[#8A3F23]" : "text-[#536459]"
                      }`}
                    >
                      {productIllustrationLabels[option]}
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="mt-2 block text-xs font-medium text-[#8A948C]">
              Gambar cadangan bila produk belum difoto. Klik untuk memilih.
            </span>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
              Warna latar
            </span>
            <input
              className="h-11 w-full cursor-pointer rounded-xl border border-[#314B3A]/15 bg-white px-2 outline-none transition focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#C76845]"
              type="color"
              {...register("surface")}
            />
            {errors.surface ? (
              <span className="mt-1 block text-xs font-bold text-[#B23C22]">{errors.surface.message}</span>
            ) : (
              <span className="mt-1 block text-xs font-medium text-[#8A948C]">{surface}</span>
            )}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
              Warna aksen
            </span>
            <input
              className="h-11 w-full cursor-pointer rounded-xl border border-[#314B3A]/15 bg-white px-2 outline-none transition focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#C76845]"
              type="color"
              {...register("accent")}
            />
            {errors.accent ? (
              <span className="mt-1 block text-xs font-bold text-[#B23C22]">{errors.accent.message}</span>
            ) : (
              <span className="mt-1 block text-xs font-medium text-[#8A948C]">{accent}</span>
            )}
          </label>
        </div>

        <div className="mt-6 rounded-2xl border border-[#314B3A]/12 bg-[#F7F5EE] p-4 sm:p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">Varian & harga</p>

          {variantFields.length > 0 ? (
            <div className="mt-3 grid gap-3">
              {variantFields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                  <div className="flex-1">
                    <TextField
                      label="Nama varian"
                      register={register}
                      name={`variants.${index}.label`}
                      error={errors.variants?.[index]?.label?.message}
                      hint={index === 0 ? "mis. 3 cm" : undefined}
                    />
                  </div>
                  <div className="flex-1">
                    <TextField
                      label="Harga"
                      register={register}
                      name={`variants.${index}.price`}
                      hint={index === 0 ? "mis. $4 / 10 pcs - boleh dikosongkan" : undefined}
                    />
                  </div>
                  <Button
                    className="mb-1"
                    variant="ghost"
                    size="icon"
                    type="button"
                    aria-label="Hapus varian ini"
                    onClick={() => removeVariant(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          ) : null}

          <Button
            className="mt-3"
            variant="outline"
            size="sm"
            type="button"
            onClick={() => appendVariant({ label: "", price: "" })}
          >
            Tambah varian
          </Button>

          <p className="mt-3 text-xs leading-5 text-[#8A948C]">
            Satu baris untuk tiap pilihan. Kalau harga belum ada, kosongkan saja - pembeli tetap
            diarahkan ke WhatsApp.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-[#314B3A]/12 bg-[#F7F5EE] p-4 sm:p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">Foto produk</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="size-full object-cover" src={imageUrl} alt="" />
              ) : (
                <ImageUp size={22} className="text-[#8A948C]" />
              )}
            </div>
            <div className="grid gap-2">
              <input
                className="block w-full text-sm text-[#405047] file:mr-3 file:rounded-full file:border-0 file:bg-[#314B3A] file:px-4 file:py-2 file:text-xs file:font-bold file:text-white"
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                disabled={uploading}
              />
              <span className="text-xs font-medium text-[#8A948C]">
                {uploading
                  ? " Sedang mengunggah..."
                  : " Kalau fotonya diganti, foto lama ikut terhapus saat disimpan."}
              </span>
            </div>
          </div>
          {imageUrl ? (
            <Button className="mt-4" variant="outline" size="sm" type="button" onClick={clearImage}>
              Hapus foto dari produk ini
            </Button>
          ) : null}
          <p className="mt-3 text-xs font-medium text-[#8A948C]">
            Bentuknya file gambar, paling besar {Math.round(MAX_PRODUCT_IMAGE_BYTES / (1024 * 1024))} MB.
          </p>

          <div className="mt-4 border-t border-[#314B3A]/12 pt-4">
            <TextField
              label="Atau tulis alamat foto"
              register={register}
              name="imageUrl"
              hint="Alamat file di situs ini, mis. /images/foto.png — atau alamat lengkap dari internet yang bisa dibuka siapa saja."
            />
            <p className="mt-3 text-xs leading-5 text-[#8A948C]">
              Cara paling mudah dan gratis: letakkan file fotonya di folder
              <code>public/images</code> pada proyek ini, lalu tulis alamatnya di kolom atas, misalnya{" "}
              <code>/images/nama-file.png</code>. Tombol unggah di atas hanya perlu kalau kamu
              menyimpan foto di luar folder itu.
            </p>
          </div>
        </div>

        <div className="mt-7">
          <div className="flex flex-wrap items-center gap-2">
            {languageOptions.map((option) => {
              const active = formLanguage === option.code;
              return (
                <button
                  key={option.code}
                  className={`min-h-9 rounded-full px-4 text-xs font-black transition-colors ${
                    active ? "bg-[#314B3A] text-white" : "bg-[#EEF1E9] text-[#536459] hover:text-[#314B3A]"
                  }`}
                  type="button"
                  onClick={() => setFormLanguage(option.code)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {TRANSLATION_FIELDS.map((field) => (
              <div key={field.key} className={field.multiline ? "sm:col-span-2" : undefined}>
                <TextField
                  label={field.label}
                  multiline={field.multiline}
                  register={register}
                  name={`translations.${formLanguage}.${field.key}`}
                  error={errors.translations?.[formLanguage]?.[field.key]?.message}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button type="submit" disabled={saving || uploading}>
            {saving ? "Menyimpan..." : "Simpan produk"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={saving} type="button">
            Batal
          </Button>
        </div>
      </form>

      <p className="mt-5 text-xs leading-5 text-[#8A948C]">
        Aturan keamanan yang sebenarnya ada di berkas <code className="rounded bg-[#F1EFE7] px-1.5 py-0.5">firestore.rules</code>{" "}
        dan <code className="mx-1 rounded bg-[#F1EFE7] px-1.5 py-0.5">storage.rules</code>. Validasi di halaman
        ini hanya mengingatkan kalau ada kolom yang belum diisi.
      </p>
    </section>
  );
}
