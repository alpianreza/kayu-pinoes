"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Globe,
  ImageUp,
  Layers,
  Palette,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState, type ChangeEvent } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { ToyArtwork } from "@/components/site/ToyArtwork";
import { Button } from "@/components/ui/button";
import { languageOptions, type Language } from "@/lib/catalog-i18n";
import { MAX_PRODUCT_IMAGE_BYTES } from "@/lib/supabase-product-admin";
import {
  productIllustrationLabels,
  productIllustrations,
} from "@/lib/supabase-products";
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

import { ConfirmModal } from "./ConfirmModal";
import { Notice } from "./Notice";
import { TextField } from "./TextField";

export function ProductEditor({
  initialForm,
  validationOptions,
  editingDocumentId,
  saving,
  serverError,
  categoryOptions = [],
  ageOptions = [],
  materialOptions = [],
  finishingOptions = [],
  onUpload,
  onClose,
  onSubmit,
}: {
  initialForm: ProductForm;
  validationOptions: ValidationOptions;
  editingDocumentId: string | null;
  saving: boolean;
  serverError: string | null;
  categoryOptions?: string[];
  ageOptions?: string[];
  materialOptions?: string[];
  finishingOptions?: string[];
  onUpload: (idValue: string, file: File) => Promise<{ imageUrl: string; imagePath: string }>;
  onClose: () => void;
  onSubmit: (record: ProductRecord) => Promise<void>;
}) {
  const [formLanguage, setFormLanguage] = useState<Language>("id");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const schema = useMemo(() => productFormSchema(validationOptions), [validationOptions]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors, isDirty },
  } = useForm<ProductForm>({
    defaultValues: initialForm,
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const surface = useWatch({ name: "surface", control });
  const accent = useWatch({ name: "accent", control });
  const illustration = useWatch({ name: "illustration", control });
  const idValue = useWatch({ name: "id", control });
  const imageUrl = useWatch({ name: "imageUrl", control });
  const statusValue = useWatch({ name: "status", control });
  const watchedIdTranslation = useWatch({
    name: "translations.id",
    control,
  }) as ProductForm["translations"]["id"] | undefined;

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: "variants" });

  const handleAttemptClose = () => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  };

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
    <>
      <section className="flex flex-col max-h-[90dvh] rounded-[2rem] border border-[#314B3A]/12 bg-white shadow-[0_24px_70px_rgba(49,75,58,0.14)] overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#314B3A]/10 bg-[#FBF9F3]/95 px-6 py-4 backdrop-blur-md">
          <div>
            <h2 id="product-editor-title" className="font-display text-2xl tracking-[-0.045em] text-[#294332]">
              {editingDocumentId ? `Edit Produk #${idValue}` : "Tambah Produk Baru"}
            </h2>
            <p className="text-xs font-semibold text-[#6B766E]">
              {editingDocumentId
                ? "Perbarui detail katalog dan terjemahan"
                : "Isi data produk baru ke katalog Kayu Pinoes"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${
                statusValue === "published"
                  ? "bg-[#DFEBDC] text-[#2F5236]"
                  : "bg-[#F1EFE7] text-[#6B766E]"
              }`}
            >
              {statusValue === "published" ? "Published" : "Draft"}
            </span>
            <Button variant="ghost" size="icon" aria-label="Tutup editor" onClick={handleAttemptClose}>
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-8">
          {serverError || uploadError ? (
            <Notice kind="error">{serverError ?? uploadError}</Notice>
          ) : null}

          {/* Section 1: Informasi Dasar & Slug */}
          <div className="rounded-2xl border border-[#314B3A]/12 bg-[#F7F5EE] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-[#C76845]" />
              <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#748077]">
                1. Informasi Dasar & Alamat URL
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <TextField
                label="Nomor ID Produk"
                register={register}
                name="id"
                disabled={editingDocumentId !== null}
                error={errors.id?.message}
                hint={editingDocumentId ? "ID permanen di database" : "Angka unik untuk produk ini"}
              />

              <div className="sm:col-span-2 space-y-2">
                <TextField
                  label="Alamat Halaman (Slug URL)"
                  error={errors.slug?.message}
                  hint="Alamat web produk: huruf kecil, angka, tanda hubung (mis. stacking-rainbow)"
                  register={register}
                  name="slug"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() =>
                    setValue("slug", slugify(getValues("translations.id.name")), {
                      shouldDirty: true,
                    })
                  }
                >
                  <Sparkles size={13} /> Buat slug otomatis dari nama Indonesia
                </Button>
              </div>
            </div>
          </div>

          {/* Section 2: Konten Multibahasa */}
          <div className="rounded-2xl border border-[#314B3A]/12 bg-white p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-[#314B3A]" />
                <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#748077]">
                  2. Konten Multibahasa
                </h3>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex items-center gap-1.5 rounded-full bg-[#EEF1E9] p-1">
                {languageOptions.map((opt) => {
                  const active = formLanguage === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => setFormLanguage(opt.code)}
                      className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                        active
                          ? "bg-[#314B3A] text-white shadow-xs"
                          : "text-[#536459] hover:text-[#27372D]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-[#8A948C]">
              Mengedit terjemahan dalam bahasa:{" "}
              <strong>{languageOptions.find((l) => l.code === formLanguage)?.label}</strong>. Data
              bahasa lain tidak akan hilang.
            </p>

            <div
              className={`grid gap-4 sm:grid-cols-2 ${
                formLanguage === "ar" ? "text-right [direction:rtl]" : ""
              }`}
            >
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

          {/* Section 3: Kategori & Usia (Master Data) */}
          <div className="rounded-2xl border border-[#314B3A]/12 bg-[#F7F5EE] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[#314B3A]" />
              <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#748077]">
                3. Kategori, Usia, Material & Finishing
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Category selector / fallback input */}
              <div className="space-y-1.5">
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                  Kategori Produk
                </span>
                {categoryOptions.length > 0 ? (
                  <select
                    className="w-full rounded-xl border border-[#314B3A]/15 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#27372D] outline-none focus:border-[#C76845]"
                    value={watchedIdTranslation?.category || ""}
                    onChange={(e) =>
                      setValue("translations.id.category", e.target.value, { shouldDirty: true })
                    }
                  >
                    <option value="">— Pilih Kategori —</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                ) : (
                  <TextField
                    label=""
                    register={register}
                    name="translations.id.category"
                    hint="Kategori (ID)"
                  />
                )}
              </div>

              {/* Age Range selector */}
              <div className="space-y-1.5">
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                  Rentang Usia
                </span>
                {ageOptions.length > 0 ? (
                  <select
                    className="w-full rounded-xl border border-[#314B3A]/15 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#27372D] outline-none focus:border-[#C76845]"
                    value={watchedIdTranslation?.age || ""}
                    onChange={(e) =>
                      setValue("translations.id.age", e.target.value, { shouldDirty: true })
                    }
                  >
                    <option value="">— Pilih Rentang Usia —</option>
                    {ageOptions.map((age) => (
                      <option key={age} value={age}>
                        {age}
                      </option>
                    ))}
                  </select>
                ) : (
                  <TextField
                    label=""
                    register={register}
                    name="translations.id.age"
                    hint='Contoh: "1-4 tahun"'
                  />
                )}
              </div>

              {/* Material selector */}
              <div className="space-y-1.5">
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                  Jenis Kayu (Material)
                </span>
                {materialOptions.length > 0 ? (
                  <select
                    className="w-full rounded-xl border border-[#314B3A]/15 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#27372D] outline-none focus:border-[#C76845]"
                    value={watchedIdTranslation?.wood || ""}
                    onChange={(e) =>
                      setValue("translations.id.wood", e.target.value, { shouldDirty: true })
                    }
                  >
                    <option value="">— Pilih Material —</option>
                    {materialOptions.map((mat) => (
                      <option key={mat} value={mat}>
                        {mat}
                      </option>
                    ))}
                  </select>
                ) : (
                  <TextField
                    label=""
                    register={register}
                    name="translations.id.wood"
                    hint="Kayu Pinus, Mahoni, dll"
                  />
                )}
              </div>

              {/* Finishing selector */}
              <div className="space-y-1.5">
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                  Finishing & Lapisan
                </span>
                {finishingOptions.length > 0 ? (
                  <select
                    className="w-full rounded-xl border border-[#314B3A]/15 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#27372D] outline-none focus:border-[#C76845]"
                    value={watchedIdTranslation?.finish || ""}
                    onChange={(e) =>
                      setValue("translations.id.finish", e.target.value, { shouldDirty: true })
                    }
                  >
                    <option value="">— Pilih Finishing —</option>
                    {finishingOptions.map((fin) => (
                      <option key={fin} value={fin}>
                        {fin}
                      </option>
                    ))}
                  </select>
                ) : (
                  <TextField
                    label=""
                    register={register}
                    name="translations.id.finish"
                    hint="Water-based, Beeswax, dll"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Visual, Ilustrasi & Palet Warna */}
          <div className="rounded-2xl border border-[#314B3A]/12 bg-white p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Palette size={16} className="text-[#C76845]" />
              <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#748077]">
                4. Visual, Ilustrasi & Warna Kartu
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                  Pilih Ilustrasi Cadangan
                </span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="group" aria-label="Ilustrasi Produk">
                  {productIllustrations.map((opt) => {
                    const isSelected = illustration === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setValue("illustration", opt, { shouldDirty: true })}
                        className={`rounded-2xl border p-2 text-center transition ${
                          isSelected
                            ? "border-[#C76845] bg-[#F9E7DF] ring-2 ring-[#C76845]/25"
                            : "border-[#314B3A]/12 bg-white hover:border-[#314B3A]/30"
                        }`}
                      >
                        <span
                          className="block aspect-square w-full overflow-hidden rounded-xl"
                          style={{ backgroundColor: surface }}
                        >
                          <ToyArtwork illustration={opt} />
                        </span>
                        <span
                          className={`mt-1.5 block text-xs font-bold ${
                            isSelected ? "text-[#8A3F23]" : "text-[#536459]"
                          }`}
                        >
                          {productIllustrationLabels[opt]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                    Warna Latar Kartu
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      className="size-11 cursor-pointer rounded-xl border border-[#314B3A]/15 bg-white p-1"
                      {...register("surface")}
                    />
                    <span className="font-mono text-xs font-semibold text-[#536459]">{surface}</span>
                  </div>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                    Warna Aksen Kartu
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      className="size-11 cursor-pointer rounded-xl border border-[#314B3A]/15 bg-white p-1"
                      {...register("accent")}
                    />
                    <span className="font-mono text-xs font-semibold text-[#536459]">{accent}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 5: Varian & Harga */}
          <div className="rounded-2xl border border-[#314B3A]/12 bg-[#F7F5EE] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#748077]">
                5. Varian Produk & Informasi Harga
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => appendVariant({ label: "", price: "" })}
              >
                + Tambah Varian
              </Button>
            </div>

            {variantFields.length === 0 ? (
              <p className="text-xs text-[#8A948C]">
                Produk ini tidak memiliki varian. Pembeli akan diarahkan dengan tombol WhatsApp &quot;Hubungi Kami&quot;.
              </p>
            ) : (
              <div className="space-y-3">
                {variantFields.map((field, idx) => (
                  <div key={field.id} className="flex items-end gap-3">
                    <div className="flex-1">
                      <TextField
                        label={`Nama Varian ${idx + 1}`}
                        register={register}
                        name={`variants.${idx}.label`}
                        error={errors.variants?.[idx]?.label?.message}
                        hint={idx === 0 ? "Contoh: Natural / Pastel / 5 Pcs" : undefined}
                      />
                    </div>
                    <div className="flex-1">
                      <TextField
                        label="Harga / Catatan Harga"
                        register={register}
                        name={`variants.${idx}.price`}
                        hint={idx === 0 ? 'Contoh: "Rp 125.000" atau "$4 / set"' : undefined}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mb-1 size-9 rounded-xl text-[#B23C22] hover:bg-[#F9E7DF]"
                      onClick={() => removeVariant(idx)}
                      aria-label={`Hapus varian ${idx + 1}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: Foto Produk & Storage */}
          <div className="rounded-2xl border border-[#314B3A]/12 bg-white p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ImageUp size={16} className="text-[#314B3A]" />
              <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#748077]">
                6. Foto Produk (Supabase Storage)
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[#314B3A]/15 bg-[#FBF9F3]">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="size-full object-cover" src={imageUrl} alt="" />
                ) : (
                  <ImageUp size={28} className="text-[#8A948C]" />
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageFile}
                  disabled={uploading}
                  className="block w-full text-xs text-[#536459] file:mr-3 file:rounded-full file:border-0 file:bg-[#314B3A] file:px-4 file:py-2 file:text-xs file:font-bold file:text-white"
                />
                <p className="text-xs text-[#8A948C]">
                  {uploading
                    ? "Sedang mengunggah ke bucket Storage 'produk'…"
                    : `Format JPG, PNG, WebP. Maksimal ${Math.round(
                        MAX_PRODUCT_IMAGE_BYTES / (1024 * 1024)
                      )} MB.`}
                </p>

                {imageUrl ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs text-[#B23C22]"
                    onClick={clearImage}
                  >
                    Hapus Foto Produk
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="pt-3 border-t border-[#314B3A]/8">
              <TextField
                label="Atau URL Foto Langsung"
                register={register}
                name="imageUrl"
                hint="Alamat URL foto publik atau path di folder public (mis. /images/produk.jpg)"
              />
            </div>
          </div>

          {/* Section 7: Status & Urutan */}
          <div className="rounded-2xl border border-[#314B3A]/12 bg-[#F7F5EE] p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#748077]">
              7. Publikasi & Urutan Tampil
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                  Status Publikasi
                </span>
                <select
                  className="w-full rounded-xl border border-[#314B3A]/15 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#27372D] outline-none focus:border-[#C76845]"
                  {...register("status")}
                >
                  <option value="draft">Disimpan saja (Draft) — Belum tampil di situs</option>
                  <option value="published">Tampil di situs (Published) — Dilihat pembeli</option>
                </select>
              </div>

              <TextField
                label="Posisi Urutan Tampil"
                register={register}
                name="order"
                error={errors.order?.message}
                hint="Angka lebih kecil akan tampil lebih dahulu di katalog"
              />
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-[#314B3A]/10 bg-[#FBF9F3]/95 px-6 py-4 backdrop-blur-md">
          <Button type="button" variant="outline" size="sm" onClick={handleAttemptClose}>
            Batal
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving || uploading}
              onClick={() => {
                setValue("status", "draft", { shouldDirty: true });
                void save();
              }}
            >
              Simpan Draft
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={saving || uploading}
              onClick={() => {
                setValue("status", "published", { shouldDirty: true });
                void save();
              }}
            >
              {saving ? "Menyimpan…" : "Simpan & Tampilkan"}
            </Button>
          </div>
        </div>
      </section>

      {/* Confirmation Modal for Unsaved Changes */}
      <ConfirmModal
        isOpen={showUnsavedModal}
        variant="warning"
        title="Perubahan belum disimpan"
        description="Kamu telah melakukan perubahan pada formulir ini. Jika ditutup sekarang, seluruh perubahan yang belum disimpan akan hilang."
        confirmLabel="Buang Perubahan & Tutup"
        cancelLabel="Tetap Lanjutkan Edit"
        onConfirm={() => {
          setShowUnsavedModal(false);
          onClose();
        }}
        onCancel={() => setShowUnsavedModal(false)}
      />
    </>
  );
}
