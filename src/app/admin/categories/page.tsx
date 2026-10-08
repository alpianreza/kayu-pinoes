"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  deleteMasterCategory,
  fetchMasterCategories,
  saveMasterCategory,
  type MasterCategory,
} from "@/lib/supabase-admin-master";
import { slugify, toMessage } from "@/lib/product-form";

import { ConfirmModal } from "../_components/ConfirmModal";
import { Notice } from "../_components/Notice";
import { TextField } from "../_components/TextField";
import { useToast } from "../_components/Toaster";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const { showToast } = useToast();

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MasterCategory | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [translations, setTranslations] = useState<Record<string, string>>({
    id: "",
    en: "",
    ar: "",
  });
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<MasterCategory | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchMasterCategories();
      setCategories(data);
      setErrorNotice(null);
    } catch (err) {
      setErrorNotice(toMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      void fetchMasterCategories()
        .then((data) => {
          if (cancelled) return;
          setCategories(data);
          setErrorNotice(null);
        })
        .catch((err: unknown) => {
          if (!cancelled) setErrorNotice(toMessage(err));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setSlug("");
    setSortOrder(String(categories.length + 1));
    setIsActive(true);
    setTranslations({ id: "", en: "", ar: "" });
    setModalError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: MasterCategory) => {
    setEditingCategory(cat);
    setSlug(cat.slug);
    setSortOrder(String(cat.sort_order));
    setIsActive(cat.is_active);
    setTranslations({
      id: cat.translations.id || "",
      en: cat.translations.en || "",
      ar: cat.translations.ar || "",
    });
    setModalError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!translations.id.trim()) {
      setModalError("Nama kategori dalam bahasa Indonesia wajib diisi.");
      return;
    }

    const finalSlug = slug.trim() || slugify(translations.id);
    if (!finalSlug) {
      setModalError("Slug URL kategori wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      await saveMasterCategory({
        id: editingCategory?.id,
        slug: finalSlug,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
        translations,
      });

      showToast(
        "success",
        editingCategory
          ? `Kategori "${translations.id}" berhasil diperbarui.`
          : `Kategori "${translations.id}" berhasil ditambahkan.`
      );
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setModalError(toMessage(err));
      showToast("error", toMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMasterCategory(deleteTarget.id);
      showToast("success", `Kategori "${deleteTarget.translations.id || deleteTarget.slug}" dihapus.`);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      showToast("error", toMessage(err));
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#C76845]">
            Master Data
          </span>
          <h1 className="font-display text-3xl tracking-[-0.05em] text-[#294332] sm:text-4xl">
            Kelola Kategori Produk
          </h1>
          <p className="mt-1 text-sm text-[#6B766E]">
            Kelola data kategori relasional Supabase dan terjemahan multibahasa.
          </p>
        </div>

        <Button onClick={openCreateModal}>
          <Plus size={16} /> Tambah Kategori
        </Button>
      </div>

      {errorNotice ? <Notice kind="error">{errorNotice}</Notice> : null}

      {/* Table List */}
      <div className="overflow-hidden rounded-[2rem] border border-[#314B3A]/12 bg-white shadow-[0_12px_36px_rgba(49,75,58,0.05)]">
        {loading ? (
          <div className="py-12 text-center text-sm font-semibold text-[#8A948C]">
            Memuat data kategori dari Supabase…
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="font-bold text-[#27372D]">Belum ada kategori terdaftar.</p>
            <Button onClick={openCreateModal} size="sm">
              <Plus size={14} /> Tambah Kategori Pertama
            </Button>
          </div>
        ) : (
          <table className="w-full text-start text-sm">
            <thead className="border-b border-[#314B3A]/10 bg-[#F7F5EE] text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
              <tr>
                <th className="px-5 py-4 text-start">Slug</th>
                <th className="px-5 py-4 text-start">Nama (ID)</th>
                <th className="px-4 py-4 text-start">Nama (EN)</th>
                <th className="px-4 py-4 text-start">Nama (AR)</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-center">Urutan</th>
                <th className="px-5 py-4 text-end">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#314B3A]/8 text-[#27372D]">
              {categories.map((cat) => (
                <tr key={cat.id} className="transition hover:bg-[#FBF9F3]/80">
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-[#6B766E]">
                    {cat.slug}
                  </td>
                  <td className="px-5 py-4 font-bold text-[#27372D]">
                    {cat.translations.id || "—"}
                  </td>
                  <td className="px-4 py-4 text-xs text-[#536459]">
                    {cat.translations.en || "—"}
                  </td>
                  <td className="px-4 py-4 text-xs text-[#536459] [direction:rtl]">
                    {cat.translations.ar || "—"}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] ${
                        cat.is_active
                          ? "bg-[#DFEBDC] text-[#2F5236]"
                          : "bg-[#F1EFE7] text-[#6B766E]"
                      }`}
                    >
                      {cat.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-[#8A948C]">
                    {cat.sort_order}
                  </td>
                  <td className="px-5 py-4 text-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(cat)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-xl text-[#B23C22] hover:bg-[#F9E7DF]"
                      onClick={() => setDeleteTarget(cat)}
                      aria-label="Hapus kategori"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen ? (
        <div className="kp-modal-backdrop fixed inset-0 z-50 overflow-y-auto bg-[#1B241E]/60 backdrop-blur-[3px]">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div className="kp-modal-panel w-full max-w-lg rounded-[2rem] border border-[#314B3A]/12 bg-white p-6 shadow-[0_24px_60px_rgba(49,75,58,0.18)]">
              <div className="flex items-center justify-between pb-4 border-b border-[#314B3A]/10">
                <h3 className="font-display text-2xl tracking-[-0.04em] text-[#27372D]">
                  {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>
                  ✕
                </Button>
              </div>

              {modalError ? (
                <div className="mt-4">
                  <Notice kind="error">{modalError}</Notice>
                </div>
              ) : null}

              <form onSubmit={handleSave} className="mt-5 space-y-4">
                <TextField
                  label="Nama Kategori (Bahasa Indonesia)"
                  value={translations.id}
                  onChange={(val) => {
                    setTranslations((prev) => ({ ...prev, id: val }));
                    if (!editingCategory && !slug) {
                      setSlug(slugify(val));
                    }
                  }}
                  hint="Wajib diisi"
                />

                <TextField
                  label="Nama Kategori (English)"
                  value={translations.en}
                  onChange={(val) => setTranslations((prev) => ({ ...prev, en: val }))}
                />

                <TextField
                  label="Nama Kategori (العربية)"
                  value={translations.ar}
                  onChange={(val) => setTranslations((prev) => ({ ...prev, ar: val }))}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Slug URL"
                    value={slug}
                    onChange={setSlug}
                    hint="Huruf kecil & tanda hubung"
                  />
                  <TextField
                    label="Urutan Tampil"
                    type="number"
                    value={sortOrder}
                    onChange={setSortOrder}
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="size-4 rounded border-[#314B3A]/30 text-[#314B3A]"
                  />
                  <span className="text-xs font-bold text-[#27372D]">
                    Status Aktif (Bisa dipilih di produk)
                  </span>
                </label>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#314B3A]/10">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Menyimpan…" : "Simpan Kategori"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        variant="danger"
        title="Hapus Kategori?"
        description={`Apakah kamu yakin ingin menghapus kategori "${
          deleteTarget?.translations.id || deleteTarget?.slug
        }"?`}
        confirmLabel="Hapus Kategori"
        cancelLabel="Batal"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
