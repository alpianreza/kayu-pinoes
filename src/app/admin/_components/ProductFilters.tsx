"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductFilterState } from "@/lib/product-filtering";

export type { ProductFilterState } from "@/lib/product-filtering";

export function ProductFilters({
  filters,
  categoryOptions,
  ageOptions,
  onChange,
  onReset,
}: {
  filters: ProductFilterState;
  categoryOptions: string[];
  ageOptions: string[];
  onChange: (next: Partial<ProductFilterState>) => void;
  onReset: () => void;
}) {
  const isFiltered =
    filters.search.trim().length > 0 ||
    filters.status !== "all" ||
    filters.category !== "all" ||
    filters.age !== "all" ||
    filters.sortBy !== "order";

  return (
    <div className="rounded-[2rem] border border-[#314B3A]/12 bg-white p-5 shadow-[0_12px_36px_rgba(49,75,58,0.05)] space-y-4">
      {/* Search and Main Status */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search input */}
        <div className="relative sm:col-span-2">
          <Search
            size={18}
            className="absolute start-4 top-1/2 -translate-y-1/2 text-[#8A948C]"
          />
          <input
            type="text"
            placeholder="Cari nama, slug, atau #ID produk…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full rounded-2xl border border-[#314B3A]/15 bg-[#FBF9F3] py-2.5 pe-4 ps-11 text-sm font-semibold text-[#27372D] placeholder:text-[#8A948C] outline-none transition focus:border-[#C76845] focus:ring-2 focus:ring-[#C76845]/20"
          />
          {filters.search ? (
            <button
              type="button"
              onClick={() => onChange({ search: "" })}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-[#8A948C] hover:text-[#27372D]"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value as ProductFilterState["status"] })}
            className="w-full rounded-2xl border border-[#314B3A]/15 bg-[#FBF9F3] px-3.5 py-2.5 text-sm font-semibold text-[#27372D] outline-none transition focus:border-[#C76845] focus:ring-2 focus:ring-[#C76845]/20"
          >
            <option value="all">Semua Status</option>
            <option value="published">Tampil di Situs (Published)</option>
            <option value="draft">Disimpan saja (Draft)</option>
          </select>
        </div>

        {/* Sorting */}
        <div>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as ProductFilterState["sortBy"] })}
            className="w-full rounded-2xl border border-[#314B3A]/15 bg-[#FBF9F3] px-3.5 py-2.5 text-sm font-semibold text-[#27372D] outline-none transition focus:border-[#C76845] focus:ring-2 focus:ring-[#C76845]/20"
          >
            <option value="order">Urutan Tampil (Default)</option>
            <option value="name">Nama Produk (A–Z)</option>
            <option value="id_desc">Produk Terbaru (ID terbesar)</option>
            <option value="id_asc">Produk Terlama (ID terkecil)</option>
          </select>
        </div>
      </div>

      {/* Secondary filters (Category & Age) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#314B3A]/8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#748077]">Kategori:</span>
            <select
              value={filters.category}
              onChange={(e) => onChange({ category: e.target.value })}
              className="rounded-xl border border-[#314B3A]/15 bg-[#FBF9F3] px-3 py-1.5 text-xs font-semibold text-[#27372D] outline-none focus:border-[#C76845]"
            >
              <option value="all">Semua Kategori</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#748077]">Rentang Usia:</span>
            <select
              value={filters.age}
              onChange={(e) => onChange({ age: e.target.value })}
              className="rounded-xl border border-[#314B3A]/15 bg-[#FBF9F3] px-3 py-1.5 text-xs font-semibold text-[#27372D] outline-none focus:border-[#C76845]"
            >
              <option value="all">Semua Usia</option>
              {ageOptions.map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isFiltered ? (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs text-[#C76845]">
            <X size={14} /> Reset Filter
          </Button>
        ) : null}
      </div>
    </div>
  );
}
