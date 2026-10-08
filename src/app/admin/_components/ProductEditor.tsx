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
import { formatAgeRange } from "@/lib/age-display";
import { languageOptions, type Language } from "@/lib/catalog-i18n";
import {
  type MasterAgeRange,
  type MasterCategory,
  type MasterFinishing,
  type MasterMaterial,
} from "@/lib/supabase-admin-master";
import { MAX_PRODUCT_IMAGE_BYTES } from "@/lib/supabase-product-admin";
import {
  productIllustrationLabels,
  productIllustrations,
} from "@/lib/supabase-products";
import { type ProductRecord } from "@/lib/product-record";
import { type ProductImageItem } from "@/lib/products";
import {
  TRANSLATION_FIELDS,
  formToRecord,
  primaryImageFromList,
  productFormSchema,
  slugify,
  toMessage,
  type ProductForm,
  type ValidationOptions,
} from "@/lib/product-form";

import { ConfirmModal } from "./ConfirmModal";
import { Notice } from "./Notice";
import { TextField } from "./TextField";

const MASTER_DATA_FIELDS = ["category", "age", "wood", "finish"] as const;

type CareOptions = Record<Language, string[]>;
type MasterDataField = (typeof MASTER_DATA_FIELDS)[number];
type MasterDataItem =
  | MasterCategory
  | MasterAgeRange
  | MasterMaterial
  | MasterFinishing;

function isAgeRange(item: MasterDataItem): item is MasterAgeRange {
  return "min_months" in item;
}

function isMasterDataField(field: string): field is MasterDataField {
  return MASTER_DATA_FIELDS.some((masterField) => masterField === field);
}

function masterValue(item: MasterDataItem, field: MasterDataField): string {
  if (field === "age" && isAgeRange(item)) {
    return formatAgeRange(item.min_months, item.max_months, "id");
  }

  if (!isAgeRange(item)) {
    const fallback = "slug" in item ? item.slug : item.code;
    return item.translations.id || fallback;
  }

  return "";
}

function masterLabel(item: MasterDataItem, field: MasterDataField, language: Language): string {
  if (field === "age" && isAgeRange(item)) {
    return formatAgeRange(item.min_months, item.max_months, language);
  }

  if (!isAgeRange(item)) {
    const fallback = "slug" in item ? item.slug : item.code;
    return item.translations[language] || item.translations.id || fallback;
  }

  return "";
}

function MasterDataSelect({
  label,
  options,
  field,
  language,
  value,
  error,
  placeholder,
  onPick,
}: {
  label: string;
  options: MasterDataItem[];
  field: MasterDataField;
  language: Language;
  value: string;
  error?: string;
  placeholder: string;
  onPick: (item: MasterDataItem | undefined) => void;
}) {
  const selectedValue =
    options.find((item) => masterLabel(item, field, language) === value)
      ? masterValue(
          options.find((item) => masterLabel(item, field, language) === value)!,
          field,
        )
      : value;
  const isLegacyValue =
    value.trim().length > 0 &&
    !options.some((item) => masterLabel(item, field, language) === value);

  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
        {label}
      </span>
      <select
        className={`w-full rounded-xl border border-[#314B3A]/15 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#27372D] outline-none transition focus:border-[#C76845] focus:ring-2 focus:ring-[#C76845]/25${
          error ? " border-[#C0503A] ring-1 ring-[#C0503A]/30" : ""
        }`}
        value={selectedValue}
        aria-invalid={error ? true : undefined}
        onChange={(event) =>
          onPick(options.find((item) => masterValue(item, field) === event.target.value))
        }
      >
        <option value="">{placeholder}</option>
        {isLegacyValue ? (
          <option value={value} disabled>
            {value} (data lama)
          </option>
        ) : null}
        {options.map((item) => {
          const optionValue = masterValue(item, field);
          return (
            <option key={optionValue} value={optionValue}>
              {masterLabel(item, field, language)}
            </option>
          );
        })}
      </select>
      {error ? <span className="mt-1 block text-xs font-bold text-[#B23C22]">{error}</span> : null}
    </label>
  );
}

function CareDropdown({
  label,
  options,
  value,
  error,
  onPick,
}: {
  label: string;
  options: string[];
  value: string;
  error?: string;
  onPick: (value: string) => void;
}) {
  const isLegacyValue = value.trim().length > 0 && !options.includes(value);

  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
        {label}
      </span>
      <select
        className={`w-full rounded-xl border border-[#314B3A]/15 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#27372D] outline-none transition focus:border-[#C76845] focus:ring-2 focus:ring-[#C76845]/25${
          error ? " border-[#C0503A] ring-1 ring-[#C0503A]/30" : ""
        }`}
        value={value}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onPick(event.target.value)}
      >
        <option value="">— Pilih Saran Perawatan —</option>
        {isLegacyValue ? (
          <option value={value} disabled>
            {value} (data lama)
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <span className="mt-1 block text-xs font-bold text-[#B23C22]">{error}</span> : null}
    </label>
  );
}

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
  careOptions,
  onUpload,
  onClose,
  onSubmit,
}: {
  initialForm: ProductForm;
  validationOptions: ValidationOptions;
  editingDocumentId: string | null;
  saving: boolean;
  serverError: string | null;
  categoryOptions?: MasterCategory[];
  ageOptions?: MasterAgeRange[];
  materialOptions?: MasterMaterial[];
  finishingOptions?: MasterFinishing[];
  careOptions?: CareOptions;
  onUpload: (idValue: string, file: File) => Promise<{ imageUrl: string; imagePath: string }>;
  onClose: () => void;
  onSubmit: (record: ProductRecord) => Promise<void>;
}) {
  const [formLanguage, setFormLanguage] = useState<Language>("id");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState("");

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
  const statusValue = useWatch({ name: "status", control });
  const watchedImages = useWatch({ name: "images", control }) as ProductForm["images"] | undefined;
  const watchedTranslations = useWatch({
    name: "translations",
    control,
  }) as ProductForm["translations"] | undefined;
  const watchedIdTranslation = watchedTranslations?.id;
  const watchedCurrentTranslation = watchedTranslations?.[formLanguage];

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

  async function handleImageFiles(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      let currentImages: ProductImageItem[] = (getValues("images") ?? []).filter((image) =>
        image.imageUrl.trim().length > 0,
      );

      for (const file of files) {
        const uploaded = await onUpload(idValue, file);
        currentImages = [
          ...currentImages,
          {
            imageUrl: uploaded.imageUrl,
            imagePath: uploaded.imagePath || undefined,
            sortOrder: currentImages.length,
            isPrimary: currentImages.length === 0,
          },
        ];
        syncPrimaryImageFields(currentImages);
      }

      setValue("images", currentImages, { shouldDirty: true });
    } catch (error) {
      setUploadError(toMessage(error));
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  function syncPrimaryImageFields(images: ProductImageItem[]) {
    const primary = primaryImageFromList(images);
    setValue("imageUrl", primary.imageUrl, { shouldDirty: true });
    setValue("imagePath", primary.imagePath, { shouldDirty: true });
  }

  function removeImage(index: number) {
    const currentImages = getValues("images") ?? [];
    const nextImages = currentImages.filter((_, position) => position !== index);

    // Jika gambar yang dihapus adalah gambar utama dan masih ada gambar
    // lain, angkat gambar pertama yang tersisa menjadi utama.
    const wasPrimary = currentImages[index]?.isPrimary;
    const adjusted =
      wasPrimary && nextImages.length > 0
        ? nextImages.map((image, position) => ({ ...image, isPrimary: position === 0 }))
        : nextImages;

    syncPrimaryImageFields(adjusted);
    setValue("images", adjusted, { shouldDirty: true });
  }

  function makeImagePrimary(index: number) {
    const currentImages = getValues("images") ?? [];
    const nextImages = currentImages.map((image, position) => ({
      ...image,
      isPrimary: position === index,
    }));

    syncPrimaryImageFields(nextImages);
    setValue("images", nextImages, { shouldDirty: true });
  }

  function addManualImageUrl(url: string) {
    const currentImages = getValues("images") ?? [];
    const nextImages: ProductImageItem[] = [
      ...currentImages,
      {
        imageUrl: url,
        sortOrder: currentImages.length,
        isPrimary: currentImages.length === 0,
      },
    ];

    syncPrimaryImageFields(nextImages);
    setValue("images", nextImages, { shouldDirty: true });
  }

  function applyMasterSelection(field: MasterDataField, item: MasterDataItem | undefined) {
    for (const language of ["id", "en", "ar"] as const) {
      const value = item ? masterLabel(item, field, language) : "";
      setValue(`translations.${language}.${field}`, value, { shouldDirty: true });
    }
  }

  function masterOptionsFor(field: MasterDataField): MasterDataItem[] {
    if (field === "category") return categoryOptions;
    if (field === "age") return ageOptions;
    if (field === "wood") return materialOptions;
    return finishingOptions;
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
              key={formLanguage}
              className={`grid gap-4 sm:grid-cols-2 ${
                formLanguage === "ar" ? "text-right [direction:rtl]" : ""
              }`}
            >
              {TRANSLATION_FIELDS.map((field) => {
                if (isMasterDataField(field.key)) {
                  const masterKey = field.key;
                  const masterOptions = masterOptionsFor(masterKey);
                  if (masterOptions.length > 0) {
                    const currentLabel = watchedCurrentTranslation?.[masterKey] ?? "";
                    return (
                      <div key={field.key} className={field.multiline ? "sm:col-span-2" : undefined}>
                        <MasterDataSelect
                          label={field.label}
                          options={masterOptions}
                          field={masterKey}
                          language={formLanguage}
                          value={currentLabel}
                          error={errors.translations?.[formLanguage]?.[masterKey]?.message}
                          placeholder={
                            masterKey === "category"
                              ? "— Pilih Kategori —"
                              : masterKey === "age"
                                ? "— Pilih Rentang Usia —"
                                : masterKey === "wood"
                                  ? "— Pilih Material —"
                                  : "— Pilih Finishing —"
                          }
                          onPick={(item) => applyMasterSelection(masterKey, item)}
                        />
                      </div>
                    );
                  }
                }

                if (field.key === "care" && careOptions && careOptions[formLanguage]?.length > 0) {
                  const currentCare = watchedCurrentTranslation?.care ?? "";
                  return (
                    <div key={field.key} className={field.multiline ? "sm:col-span-2" : undefined}>
                      <CareDropdown
                        label={field.label}
                        options={careOptions[formLanguage]}
                        value={currentCare}
                        error={errors.translations?.[formLanguage]?.[field.key]?.message}
                        onPick={(selectedCare) =>
                          setValue(`translations.${formLanguage}.care`, selectedCare, {
                            shouldDirty: true,
                          })
                        }
                      />
                    </div>
                  );
                }

                return (
                  <div key={field.key} className={field.multiline ? "sm:col-span-2" : undefined}>
                    <TextField
                      label={field.label}
                      multiline={field.multiline}
                      register={register}
                      name={`translations.${formLanguage}.${field.key}`}
                      error={errors.translations?.[formLanguage]?.[field.key]?.message}
                    />
                  </div>
                );
              })}
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
              <div>
                {masterOptionsFor("category").length > 0 ? (
                  <MasterDataSelect
                    label="Kategori Produk"
                    options={masterOptionsFor("category")}
                    field="category"
                    language="id"
                    value={watchedIdTranslation?.category || ""}
                    placeholder="— Pilih Kategori —"
                    onPick={(item) => applyMasterSelection("category", item)}
                  />
                ) : (
                  <TextField
                    label="Kategori Produk"
                    register={register}
                    name="translations.id.category"
                    hint="Kategori (ID)"
                  />
                )}
              </div>

              {/* Age Range selector */}
              <div>
                {masterOptionsFor("age").length > 0 ? (
                  <MasterDataSelect
                    label="Rentang Usia"
                    options={masterOptionsFor("age")}
                    field="age"
                    language="id"
                    value={watchedIdTranslation?.age || ""}
                    placeholder="— Pilih Rentang Usia —"
                    onPick={(item) => applyMasterSelection("age", item)}
                  />
                ) : (
                  <TextField
                    label="Rentang Usia"
                    register={register}
                    name="translations.id.age"
                    hint='Contoh: "1-4 tahun"'
                  />
                )}
              </div>

              {/* Material selector */}
              <div>
                {masterOptionsFor("wood").length > 0 ? (
                  <MasterDataSelect
                    label="Jenis Kayu (Material)"
                    options={masterOptionsFor("wood")}
                    field="wood"
                    language="id"
                    value={watchedIdTranslation?.wood || ""}
                    placeholder="— Pilih Material —"
                    onPick={(item) => applyMasterSelection("wood", item)}
                  />
                ) : (
                  <TextField
                    label="Jenis Kayu (Material)"
                    register={register}
                    name="translations.id.wood"
                    hint="Kayu Pinus, Mahoni, dll"
                  />
                )}
              </div>

              {/* Finishing selector */}
              <div>
                {masterOptionsFor("finish").length > 0 ? (
                  <MasterDataSelect
                    label="Finishing & Lapisan"
                    options={masterOptionsFor("finish")}
                    field="finish"
                    language="id"
                    value={watchedIdTranslation?.finish || ""}
                    placeholder="— Pilih Finishing —"
                    onPick={(item) => applyMasterSelection("finish", item)}
                  />
                ) : (
                  <TextField
                    label="Finishing & Lapisan"
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

            <div className="space-y-4">
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleImageFiles}
                  disabled={uploading}
                  className="block w-full text-xs text-[#536459] file:mr-3 file:rounded-full file:border-0 file:bg-[#314B3A] file:px-4 file:py-2 file:text-xs file:font-bold file:text-white"
                />
                <p className="text-xs text-[#8A948C]">
                  {uploading
                    ? "Sedang mengunggah ke bucket Storage 'produk'…"
                    : `Pilih satu atau beberapa foto. Format JPG, PNG, WebP. Maksimal ${Math.round(
                        MAX_PRODUCT_IMAGE_BYTES / (1024 * 1024)
                      )} MB per foto.`}
                </p>
              </div>

              {(watchedImages ?? []).length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {(watchedImages ?? []).map((image, index) => (
                    <div
                      key={`${image.imageUrl}-${index}`}
                      className={`relative overflow-hidden rounded-2xl border p-2 ${
                        image.isPrimary
                          ? "border-[#C76845] ring-2 ring-[#C76845]/25"
                          : "border-[#314B3A]/12"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="aspect-square w-full object-cover"
                        src={image.imageUrl}
                        alt=""
                      />
                      {image.isPrimary ? (
                        <span className="absolute left-2 top-2 rounded-full bg-[#C76845] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-white">
                          Utama
                        </span>
                      ) : null}

                      <div className="mt-2 flex items-center gap-1.5">
                        {!image.isPrimary ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 flex-1 text-xs"
                            onClick={() => makeImagePrimary(index)}
                          >
                            Jadikan Utama
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-xl text-[#B23C22] hover:bg-[#F9E7DF]"
                          onClick={() => removeImage(index)}
                          aria-label={`Hapus foto ${index + 1}`}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="pt-3 border-t border-[#314B3A]/8">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                    Atau Tambah URL Foto Langsung
                  </span>
                  <div className="flex gap-2">
                    <input
                      className="w-full rounded-xl border border-[#314B3A]/15 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#27372D] outline-none transition focus:border-[#C76845] focus:ring-2 focus:ring-[#C76845]/25"
                      type="url"
                      value={manualImageUrl}
                      placeholder="https://… atau /images/produk.jpg"
                      onChange={(event) => setManualImageUrl(event.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!manualImageUrl.trim()}
                      onClick={() => {
                        addManualImageUrl(manualImageUrl.trim());
                        setManualImageUrl("");
                      }}
                    >
                      Tambah
                    </Button>
                  </div>
                  <span className="mt-1 block text-xs font-medium text-[#8A948C]">
                    URL ini ditampilkan di galeri, tetapi tidak diunggah ke Storage.
                  </span>
                </label>
              </div>
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
