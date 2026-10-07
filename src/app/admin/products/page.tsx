"use client";

import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { staticProductSlug } from "@/lib/products";
import type { ProductRecord } from "@/lib/product-record";
import {
  deleteProductImage,
  deleteProductRecord,
  productDocumentExists,
  productDocumentId,
  saveProductRecord,
  swapProductOrder,
  uploadProductImage,
} from "@/lib/supabase-product-admin";
import {
  subscribeToManagedProducts,
  type ManagedProduct,
  type ProductStatus,
} from "@/lib/supabase-products";
import {
  createEmptyForm,
  formFromProduct,
  toMessage,
  toRecord,
  validateForm,
  type ProductForm,
} from "@/lib/product-form";
import {
  filterProducts,
  nextStatus,
  type ProductFilterState,
} from "@/lib/product-filtering";
import {
  fetchMasterCategories,
  fetchMasterMaterials,
  fetchMasterFinishings,
  type MasterCategory,
  type MasterMaterial,
  type MasterFinishing,
} from "@/lib/supabase-admin-master";

import { ConfirmModal } from "../_components/ConfirmModal";
import { Notice } from "../_components/Notice";
import { ProductEditor } from "../_components/ProductEditor";
import { ProductFilters } from "../_components/ProductFilters";
import { ProductList } from "../_components/ProductList";

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const actionParam = searchParams.get("action");
  const editParam = searchParams.get("edit");

  const [managedProducts, setManagedProducts] = useState<ManagedProduct[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  // Master Data Options for Selectors
  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>([]);
  const [masterMaterials, setMasterMaterials] = useState<MasterMaterial[]>([]);
  const [masterFinishings, setMasterFinishings] = useState<MasterFinishing[]>([]);

  // Filter State
  const [filters, setFilters] = useState<ProductFilterState>({
    search: "",
    status: "all",
    category: "all",
    age: "all",
    sortBy: "order",
  });

  // Editor State
  const [editorOpen, setEditorOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorTriggerRef = useRef<HTMLElement | null>(null);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [editorInitialForm, setEditorInitialForm] = useState<ProductForm>(() => createEmptyForm([]));
  const [editorSession, setEditorSession] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Confirmation Modal State for Delete
  const [deleteProductTarget, setDeleteProductTarget] = useState<ManagedProduct | null>(null);

  const sessionUploadsRef = useRef<string[]>([]);
  const attachedImageRef = useRef<string | null>(null);
  const savedImageRef = useRef<string | null | undefined>(undefined);
  const editorWasOpenRef = useRef(false);

  // 1. Subscribe to Managed Products
  useEffect(() => {
    return subscribeToManagedProducts(
      (nextProducts) => {
        setManagedProducts(nextProducts);
        setProductsLoaded(true);
        setListError(null);
      },
      (error) => {
        setListError(toMessage(error));
        setProductsLoaded(true);
      }
    );
  }, []);

  // 2. Fetch Master Data for Selectors
  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      void Promise.all([
        fetchMasterCategories(),
        fetchMasterMaterials(),
        fetchMasterFinishings(),
      ])
        .then(([cats, mats, fins]) => {
          if (cancelled) return;
          setMasterCategories(cats);
          setMasterMaterials(mats);
          setMasterFinishings(fins);
        })
        .catch((err: unknown) => {
          if (!cancelled) setListError(toMessage(err));
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function rememberEditorTrigger() {
    editorTriggerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }

  const startCreate = useCallback(() => {
    rememberEditorTrigger();
    setEditorInitialForm(createEmptyForm(managedProducts));
    setEditingDocumentId(null);
    setFormError(null);
    setEditorSession((c) => c + 1);
    sessionUploadsRef.current = [];
    attachedImageRef.current = null;
    savedImageRef.current = undefined;
    setEditorOpen(true);
  }, [managedProducts]);

  const startEdit = useCallback(
    (product: ManagedProduct) => {
      rememberEditorTrigger();
      setEditorInitialForm(formFromProduct(product));
      setEditingDocumentId(product.documentId);
      setFormError(null);
      setEditorSession((c) => c + 1);
      sessionUploadsRef.current = [];
      attachedImageRef.current = product.imagePath ?? null;
      savedImageRef.current = undefined;
      setEditorOpen(true);
    },
    []
  );

  // URL query params trigger auto-open
  const autoOpenedParamRef = useRef<string | null>(null);
  useEffect(() => {
    const paramKey = actionParam ?? editParam;
    if (!productsLoaded || !paramKey) return;
    if (autoOpenedParamRef.current === paramKey) return;

    const target = editParam
      ? managedProducts.find((p) => p.documentId === editParam)
      : undefined;

    if (target || actionParam === "new") {
      autoOpenedParamRef.current = paramKey;
      queueMicrotask(() => {
        if (target) startEdit(target);
        else startCreate();
      });
    }
  }, [productsLoaded, actionParam, editParam, managedProducts, startCreate, startEdit]);

  // Derive filter dropdown options
  const categoryOptions = useMemo(() => {
    const fromMaster = masterCategories
      .map((c) => c.translations.id || c.slug)
      .filter(Boolean);
    const fromProducts = managedProducts
      .map((p) => p.translations.id?.category)
      .filter((c): c is string => Boolean(c && c.trim().length > 0));
    return Array.from(new Set([...fromMaster, ...fromProducts]));
  }, [masterCategories, managedProducts]);

  const ageOptions = useMemo(() => {
    const fromProducts = managedProducts
      .map((p) => p.translations.id?.age)
      .filter((a): a is string => Boolean(a && a.trim().length > 0));
    return Array.from(new Set(fromProducts));
  }, [managedProducts]);

  const materialOptions = useMemo(() => {
    return masterMaterials
      .map((m) => m.translations.id || m.code)
      .filter(Boolean);
  }, [masterMaterials]);

  const finishingOptions = useMemo(() => {
    return masterFinishings
      .map((f) => f.translations.id || f.code)
      .filter(Boolean);
  }, [masterFinishings]);

  // Filter & Sorting Logic
  const filteredProducts = useMemo(
    () => filterProducts(managedProducts, filters),
    [managedProducts, filters],
  );

  const validationOptions = useMemo(
    () => ({
      isEditing: editingDocumentId !== null,
      existingDocumentIds: managedProducts.map((p) => p.documentId),
      otherSlugs: managedProducts
        .filter((p) => p.documentId !== editingDocumentId)
        .map((p) => p.slug ?? staticProductSlug(p.id) ?? String(p.id)),
    }),
    [editingDocumentId, managedProducts]
  );

  useEffect(() => {
    if (!editorOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [editorOpen]);

  useEffect(() => {
    if (editorOpen) {
      editorWasOpenRef.current = true;
      editorRef.current?.focus();
      return;
    }

    if (!editorWasOpenRef.current) return;
    editorWasOpenRef.current = false;

    const kept = savedImageRef.current ?? null;
    for (const path of sessionUploadsRef.current) {
      if (path !== kept) void deleteProductImage(path);
    }
    sessionUploadsRef.current = [];

    if (savedImageRef.current !== undefined) {
      const attached = attachedImageRef.current;
      if (attached && attached !== savedImageRef.current) void deleteProductImage(attached);
      attachedImageRef.current = null;
      savedImageRef.current = undefined;
    }

    editorTriggerRef.current?.focus();
    editorTriggerRef.current = null;
  }, [editorOpen]);

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
    setEditingDocumentId(null);
    setFormError(null);
  }, []);

  async function handleSave(record: ProductRecord) {
    const formForCheck: ProductForm = {
      id: String(record.id),
      slug: record.slug ?? "",
      order: String(record.order),
      status: record.status,
      surface: record.surface,
      accent: record.accent,
      illustration: record.illustration,
      imageUrl: record.imageUrl ?? "",
      imagePath: record.imagePath ?? "",
      variants: (record.variants ?? []).map((v) => ({ label: v.label, price: v.price })),
      translations: record.translations,
    };
    const errors = validateForm(formForCheck, validationOptions);

    if (errors.length > 0) {
      setFormError(errors.join(" "));
      return;
    }

    setSaving(true);
    setFormError(null);
    setNotice(null);

    try {
      const documentId = productDocumentId(record.id);
      if (editingDocumentId !== null && !(await productDocumentExists(documentId))) {
        setFormError(
          `Produk #${record.id} telah dihapus dari perangkat lain, sehingga tidak bisa disimpan sebagai hasil edit.`
        );
        return;
      }

      await saveProductRecord(record);
      savedImageRef.current = record.imagePath ?? null;

      setNotice(`Produk "${record.translations.id.name}" berhasil disimpan.`);
      closeEditor();
    } catch (err) {
      setFormError(toMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(idValue: string, file: File) {
    const numericId = Number(idValue.trim());
    const documentId =
      Number.isInteger(numericId) && numericId >= 1 ? productDocumentId(numericId) : "produk-baru";
    const uploaded = await uploadProductImage(documentId, file);
    sessionUploadsRef.current = [...sessionUploadsRef.current, uploaded.imagePath];
    return uploaded;
  }

  async function toggleStatus(product: ManagedProduct) {
    const nextProductStatus: ProductStatus = nextStatus(product.status);

    setBusyAction(`status:${product.documentId}`);
    setListError(null);
    setNotice(null);

    try {
      await saveProductRecord({ ...toRecord(product), status: nextProductStatus });
      setNotice(
        `"${product.translations.id?.name ?? product.documentId}" sekarang berstatus ${
          nextProductStatus === "published"
            ? "Tampil di situs (Published)"
            : "Disimpan saja (Draft)"
        }.`
      );
    } catch (err) {
      setListError(toMessage(err));
    } finally {
      setBusyAction(null);
    }
  }

  async function moveProduct(product: ManagedProduct, direction: -1 | 1) {
    const index = filteredProducts.findIndex((item) => item.documentId === product.documentId);
    const targetIndex = index + direction;

    if (index < 0 || targetIndex < 0 || targetIndex >= filteredProducts.length) return;

    setBusyAction(`move:${product.documentId}`);
    setListError(null);
    setNotice(null);

    try {
      await swapProductOrder(filteredProducts[index], filteredProducts[targetIndex]);
      setNotice("Urutan tampil produk berhasil diperbarui.");
    } catch (err) {
      setListError(toMessage(err));
    } finally {
      setBusyAction(null);
    }
  }

  async function confirmRemoveProduct() {
    if (!deleteProductTarget) return;

    const product = deleteProductTarget;
    const label = product.translations.id?.name ?? product.documentId;

    setBusyAction(`delete:${product.documentId}`);
    setListError(null);
    setNotice(null);
    setDeleteProductTarget(null);

    try {
      await deleteProductRecord(product.documentId);
      setNotice(`Produk "${label}" berhasil dihapus.`);
    } catch (err) {
      setListError(toMessage(err));
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#C76845]">
            Katalog Produk
          </span>
          <h1 className="font-display text-3xl tracking-[-0.05em] text-[#294332] sm:text-4xl">
            Kelola Produk
          </h1>
          <p className="mt-1 text-sm text-[#6B766E]">
            Kelola data produk, varian, gambar, terjemahan, dan status publikasi katalog.
          </p>
        </div>

        <Button onClick={startCreate}>
          <Plus size={16} /> Tambah Produk Baru
        </Button>
      </div>

      {/* Notices */}
      {listError ? <Notice kind="error">{listError}</Notice> : null}
      {notice ? <Notice kind="success">{notice}</Notice> : null}

      {/* Filter Toolbar */}
      <ProductFilters
        filters={filters}
        categoryOptions={categoryOptions}
        ageOptions={ageOptions}
        onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
        onReset={() =>
          setFilters({
            search: "",
            status: "all",
            category: "all",
            age: "all",
            sortBy: "order",
          })
        }
      />

      {/* Editor Modal */}
      {editorOpen ? (
        <div className="kp-modal-backdrop fixed inset-0 z-50 overflow-y-auto bg-[#1B241E]/60 backdrop-blur-[3px]">
          <div className="flex min-h-full items-start justify-center p-4 sm:p-6 lg:p-8">
            <div
              ref={editorRef}
              className="kp-modal-panel w-full max-w-5xl outline-none"
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-editor-title"
              tabIndex={-1}
            >
              <ProductEditor
                key={editorSession}
                initialForm={editorInitialForm}
                validationOptions={validationOptions}
                editingDocumentId={editingDocumentId}
                saving={saving}
                serverError={formError}
                categoryOptions={categoryOptions}
                ageOptions={ageOptions}
                materialOptions={materialOptions}
                finishingOptions={finishingOptions}
                onUpload={handleUpload}
                onClose={closeEditor}
                onSubmit={handleSave}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Product Table / List */}
      <ProductList
        products={filteredProducts}
        productsLoaded={productsLoaded}
        loadFailed={listError !== null}
        busyAction={busyAction}
        totalFilteredCount={managedProducts.length}
        onMove={moveProduct}
        onToggleStatus={toggleStatus}
        onEdit={startEdit}
        onRemove={(p) => setDeleteProductTarget(p)}
        onCreateNew={startCreate}
      />

      {/* Custom Confirmation Modal for Delete */}
      <ConfirmModal
        isOpen={deleteProductTarget !== null}
        variant="danger"
        title="Hapus produk ini?"
        description={`Apakah kamu yakin ingin menghapus produk "${
          deleteProductTarget?.translations.id?.name ?? deleteProductTarget?.documentId
        }"? Produk yang dihapus tidak dapat dikembalikan.`}
        confirmLabel="Ya, Hapus Produk"
        cancelLabel="Batal"
        onConfirm={confirmRemoveProduct}
        onCancel={() => setDeleteProductTarget(null)}
      />
    </div>
  );
}
