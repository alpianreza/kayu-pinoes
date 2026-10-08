"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  deleteMasterAgeRange,
  deleteMasterFinishing,
  deleteMasterMaterial,
  fetchMasterAgeRanges,
  fetchMasterFinishings,
  fetchMasterMaterials,
  saveMasterAgeRange,
  saveMasterFinishing,
  saveMasterMaterial,
  type MasterAgeRange,
  type MasterFinishing,
  type MasterMaterial,
} from "@/lib/supabase-admin-master";
import { slugify, toMessage } from "@/lib/product-form";

import { ConfirmModal } from "../_components/ConfirmModal";
import { Notice } from "../_components/Notice";
import { useToast } from "../_components/Toaster";
import { TextField } from "../_components/TextField";

export default function AdminMasterDataPage() {
  const [activeTab, setActiveTab] = useState<"material" | "finishing" | "age">("material");

  // Data States
  const [materials, setMaterials] = useState<MasterMaterial[]>([]);
  const [finishings, setFinishings] = useState<MasterFinishing[]>([]);
  const [ageRanges, setAgeRanges] = useState<MasterAgeRange[]>([]);
  const [loading, setLoading] = useState(true);

  // Notices
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const { showToast } = useToast();

  // Modal State for Text-based Master (Material / Finishing)
  const [textModalOpen, setTextModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterMaterial | MasterFinishing | null>(null);
  const [code, setCode] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [translations, setTranslations] = useState<Record<string, string>>({ id: "", en: "", ar: "" });
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Modal State for Age Range
  const [ageModalOpen, setAgeModalOpen] = useState(false);
  const [editingAge, setEditingAge] = useState<MasterAgeRange | null>(null);
  const [minMonths, setMinMonths] = useState("12");
  const [maxMonths, setMaxMonths] = useState("48");
  const [ageSortOrder, setAgeSortOrder] = useState("0");

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "material" | "finishing" | "age";
    id: number;
    label: string;
  } | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [m, f, a] = await Promise.all([
        fetchMasterMaterials(),
        fetchMasterFinishings(),
        fetchMasterAgeRanges(),
      ]);
      setMaterials(m);
      setFinishings(f);
      setAgeRanges(a);
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
      void Promise.all([fetchMasterMaterials(), fetchMasterFinishings(), fetchMasterAgeRanges()])
        .then(([m, f, a]) => {
          if (cancelled) return;
          setMaterials(m);
          setFinishings(f);
          setAgeRanges(a);
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

  /* ================= TEXT MODAL HANDLERS (MATERIAL / FINISHING) ================= */

  const openTextModal = (item?: MasterMaterial | MasterFinishing) => {
    if (item) {
      setEditingItem(item);
      setCode(item.code);
      setSortOrder(String(item.sort_order));
      setIsActive(item.is_active);
      setTranslations({
        id: item.translations.id || "",
        en: item.translations.en || "",
        ar: item.translations.ar || "",
      });
    } else {
      setEditingItem(null);
      setCode("");
      setSortOrder(String(activeTab === "material" ? materials.length + 1 : finishings.length + 1));
      setIsActive(true);
      setTranslations({ id: "", en: "", ar: "" });
    }
    setModalError(null);
    setTextModalOpen(true);
  };

  const handleSaveTextMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!translations.id.trim()) {
      setModalError("Nama dalam bahasa Indonesia wajib diisi.");
      return;
    }

    const finalCode = code.trim() || slugify(translations.id);
    setSaving(true);

    try {
      if (activeTab === "material") {
        await saveMasterMaterial({
          id: editingItem?.id,
          code: finalCode,
          sort_order: Number(sortOrder) || 0,
          is_active: isActive,
          translations,
        });
        showToast("success", `Material "${translations.id}" disimpan.`);
      } else {
        await saveMasterFinishing({
          id: editingItem?.id,
          code: finalCode,
          sort_order: Number(sortOrder) || 0,
          is_active: isActive,
          translations,
        });
        showToast("success", `Finishing "${translations.id}" disimpan.`);
      }

      setTextModalOpen(false);
      await loadAll();
    } catch (err) {
      setModalError(toMessage(err));
      showToast("error", toMessage(err));
    } finally {
      setSaving(false);
    }
  };

  /* ================= AGE MODAL HANDLERS ================= */

  const openAgeModal = (item?: MasterAgeRange) => {
    if (item) {
      setEditingAge(item);
      setMinMonths(String(item.min_months));
      setMaxMonths(String(item.max_months));
      setAgeSortOrder(String(item.sort_order));
    } else {
      setEditingAge(null);
      setMinMonths("12");
      setMaxMonths("48");
      setAgeSortOrder(String(ageRanges.length + 1));
    }
    setModalError(null);
    setAgeModalOpen(true);
  };

  const handleSaveAge = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const min = Number(minMonths);
    const max = Number(maxMonths);

    if (!Number.isInteger(min) || min < 0) {
      setModalError("Minimal bulan harus angka 0 atau lebih.");
      return;
    }
    if (!Number.isInteger(max) || max < min) {
      setModalError("Maksimal bulan harus lebih besar dari minimal.");
      return;
    }

    setSaving(true);
    try {
      await saveMasterAgeRange({
        id: editingAge?.id,
        min_months: min,
        max_months: max,
        sort_order: Number(ageSortOrder) || 0,
      });

      showToast("success", `Rentang usia ${min}-${max} bulan disimpan.`);
      setAgeModalOpen(false);
      await loadAll();
    } catch (err) {
      setModalError(toMessage(err));
      showToast("error", toMessage(err));
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE HANDLER ================= */

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "material") {
        await deleteMasterMaterial(deleteTarget.id);
      } else if (deleteTarget.type === "finishing") {
        await deleteMasterFinishing(deleteTarget.id);
      } else {
        await deleteMasterAgeRange(deleteTarget.id);
      }

      showToast("success", `Item "${deleteTarget.label}" berhasil dihapus.`);
      setDeleteTarget(null);
      await loadAll();
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
            Material, Finishing & Usia
          </h1>
          <p className="mt-1 text-sm text-[#6B766E]">
            Kelola data relasional dasar yang dipakai pada spesifikasi produk.
          </p>
        </div>

        <Button
          onClick={() => {
            if (activeTab === "age") openAgeModal();
            else openTextModal();
          }}
        >
          <Plus size={16} /> Tambah {activeTab === "material" ? "Material" : activeTab === "finishing" ? "Finishing" : "Rentang Usia"}
        </Button>
      </div>

      {errorNotice ? <Notice kind="error">{errorNotice}</Notice> : null}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#314B3A]/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("material")}
          className={`rounded-2xl px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.08em] transition ${
            activeTab === "material"
              ? "bg-[#314B3A] text-white shadow-xs"
              : "bg-white text-[#536459] hover:bg-[#EEF1E9]"
          }`}
        >
          Material Kayu ({materials.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("finishing")}
          className={`rounded-2xl px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.08em] transition ${
            activeTab === "finishing"
              ? "bg-[#314B3A] text-white shadow-xs"
              : "bg-white text-[#536459] hover:bg-[#EEF1E9]"
          }`}
        >
          Finishing & Lapisan ({finishings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("age")}
          className={`rounded-2xl px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.08em] transition ${
            activeTab === "age"
              ? "bg-[#314B3A] text-white shadow-xs"
              : "bg-white text-[#536459] hover:bg-[#EEF1E9]"
          }`}
        >
          Rentang Usia ({ageRanges.length})
        </button>
      </div>

      {/* Content Table */}
      <div className="overflow-hidden rounded-[2rem] border border-[#314B3A]/12 bg-white shadow-[0_12px_36px_rgba(49,75,58,0.05)]">
        {loading ? (
          <div className="py-12 text-center text-sm font-semibold text-[#8A948C]">
            Memuat data master dari Supabase…
          </div>
        ) : activeTab === "age" ? (
          /* Age Range Table */
          ageRanges.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="font-bold text-[#27372D]">Belum ada rentang usia terdaftar.</p>
              <Button onClick={() => openAgeModal()} size="sm">
                <Plus size={14} /> Tambah Rentang Usia
              </Button>
            </div>
          ) : (
            <table className="w-full text-start text-sm">
              <thead className="border-b border-[#314B3A]/10 bg-[#F7F5EE] text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                <tr>
                  <th className="px-5 py-4 text-start">Format Teks Publik</th>
                  <th className="px-5 py-4 text-center">Minimal (Bulan)</th>
                  <th className="px-5 py-4 text-center">Maksimal (Bulan)</th>
                  <th className="px-5 py-4 text-center">Urutan</th>
                  <th className="px-5 py-4 text-end">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#314B3A]/8 text-[#27372D]">
                {ageRanges.map((age) => (
                  <tr key={age.id} className="transition hover:bg-[#FBF9F3]/80">
                    <td className="px-5 py-4 font-bold text-[#27372D]">
                      {age.min_months < 12
                        ? `${age.min_months}-${age.max_months} bulan`
                        : `${Math.round(age.min_months / 12)}-${Math.round(age.max_months / 12)} tahun`}
                    </td>
                    <td className="px-5 py-4 text-center text-xs font-semibold text-[#536459]">
                      {age.min_months} bulan
                    </td>
                    <td className="px-5 py-4 text-center text-xs font-semibold text-[#536459]">
                      {age.max_months} bulan
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-[#8A948C]">
                      {age.sort_order}
                    </td>
                    <td className="px-5 py-4 text-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openAgeModal(age)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-xl text-[#B23C22] hover:bg-[#F9E7DF]"
                        onClick={() =>
                          setDeleteTarget({
                            type: "age",
                            id: age.id,
                            label: `${age.min_months}-${age.max_months} bulan`,
                          })
                        }
                      >
                        <Trash2 size={15} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          /* Material / Finishing Table */
          (activeTab === "material" ? materials : finishings).length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="font-bold text-[#27372D]">Belum ada item terdaftar.</p>
              <Button onClick={() => openTextModal()} size="sm">
                <Plus size={14} /> Tambah Item Pertama
              </Button>
            </div>
          ) : (
            <table className="w-full text-start text-sm">
              <thead className="border-b border-[#314B3A]/10 bg-[#F7F5EE] text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                <tr>
                  <th className="px-5 py-4 text-start">Kode Item</th>
                  <th className="px-5 py-4 text-start">Nama (ID)</th>
                  <th className="px-4 py-4 text-start">Nama (EN)</th>
                  <th className="px-4 py-4 text-start">Nama (AR)</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-4 py-4 text-center">Urutan</th>
                  <th className="px-5 py-4 text-end">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#314B3A]/8 text-[#27372D]">
                {(activeTab === "material" ? materials : finishings).map((item) => (
                  <tr key={item.id} className="transition hover:bg-[#FBF9F3]/80">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-[#6B766E]">
                      {item.code}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#27372D]">
                      {item.translations.id || "—"}
                    </td>
                    <td className="px-4 py-4 text-xs text-[#536459]">
                      {item.translations.en || "—"}
                    </td>
                    <td className="px-4 py-4 text-xs text-[#536459] [direction:rtl]">
                      {item.translations.ar || "—"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] ${
                          item.is_active
                            ? "bg-[#DFEBDC] text-[#2F5236]"
                            : "bg-[#F1EFE7] text-[#6B766E]"
                        }`}
                      >
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-[#8A948C]">
                      {item.sort_order}
                    </td>
                    <td className="px-5 py-4 text-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openTextModal(item)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-xl text-[#B23C22] hover:bg-[#F9E7DF]"
                        onClick={() =>
                          setDeleteTarget({
                            type: activeTab,
                            id: item.id,
                            label: item.translations.id || item.code,
                          })
                        }
                      >
                        <Trash2 size={15} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* Modal for Text Master (Material / Finishing) */}
      {textModalOpen ? (
        <div className="kp-modal-backdrop fixed inset-0 z-50 overflow-y-auto bg-[#1B241E]/60 backdrop-blur-[3px]">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div className="kp-modal-panel w-full max-w-lg rounded-[2rem] border border-[#314B3A]/12 bg-white p-6 shadow-[0_24px_60px_rgba(49,75,58,0.18)]">
              <div className="flex items-center justify-between pb-4 border-b border-[#314B3A]/10">
                <h3 className="font-display text-2xl tracking-[-0.04em] text-[#27372D]">
                  {editingItem ? `Edit ${activeTab}` : `Tambah ${activeTab} Baru`}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setTextModalOpen(false)}>
                  ✕
                </Button>
              </div>

              {modalError ? (
                <div className="mt-4">
                  <Notice kind="error">{modalError}</Notice>
                </div>
              ) : null}

              <form onSubmit={handleSaveTextMaster} className="mt-5 space-y-4">
                <TextField
                  label="Nama (Bahasa Indonesia)"
                  value={translations.id}
                  onChange={(val) => {
                    setTranslations((prev) => ({ ...prev, id: val }));
                    if (!editingItem && !code) setCode(slugify(val));
                  }}
                  hint="Wajib diisi"
                />

                <TextField
                  label="Nama (English)"
                  value={translations.en}
                  onChange={(val) => setTranslations((prev) => ({ ...prev, en: val }))}
                />

                <TextField
                  label="Nama (العربية)"
                  value={translations.ar}
                  onChange={(val) => setTranslations((prev) => ({ ...prev, ar: val }))}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Kode Unik" value={code} onChange={setCode} hint="Huruf kecil" />
                  <TextField
                    label="Urutan"
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
                    Status Aktif (Dapat dipilih di produk)
                  </span>
                </label>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#314B3A]/10">
                  <Button type="button" variant="outline" onClick={() => setTextModalOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Menyimpan…" : "Simpan Data"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal for Age Range */}
      {ageModalOpen ? (
        <div className="kp-modal-backdrop fixed inset-0 z-50 overflow-y-auto bg-[#1B241E]/60 backdrop-blur-[3px]">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div className="kp-modal-panel w-full max-w-md rounded-[2rem] border border-[#314B3A]/12 bg-white p-6 shadow-[0_24px_60px_rgba(49,75,58,0.18)]">
              <div className="flex items-center justify-between pb-4 border-b border-[#314B3A]/10">
                <h3 className="font-display text-2xl tracking-[-0.04em] text-[#27372D]">
                  {editingAge ? "Edit Rentang Usia" : "Tambah Rentang Usia"}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setAgeModalOpen(false)}>
                  ✕
                </Button>
              </div>

              {modalError ? (
                <div className="mt-4">
                  <Notice kind="error">{modalError}</Notice>
                </div>
              ) : null}

              <form onSubmit={handleSaveAge} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Minimal Bulan"
                    type="number"
                    value={minMonths}
                    onChange={setMinMonths}
                    hint="Misal: 12 (1 tahun)"
                  />
                  <TextField
                    label="Maksimal Bulan"
                    type="number"
                    value={maxMonths}
                    onChange={setMaxMonths}
                    hint="Misal: 48 (4 tahun)"
                  />
                </div>

                <TextField
                  label="Urutan Tampil"
                  type="number"
                  value={ageSortOrder}
                  onChange={setAgeSortOrder}
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-[#314B3A]/10">
                  <Button type="button" variant="outline" onClick={() => setAgeModalOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Menyimpan…" : "Simpan Usia"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        variant="danger"
        title="Hapus Master Data?"
        description={`Apakah kamu yakin ingin menghapus item "${deleteTarget?.label}"?`}
        confirmLabel="Hapus Data"
        cancelLabel="Batal"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
