"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { type ManagedProduct } from "@/lib/supabase-products";
import { displayName, isBusyFor } from "@/lib/product-form";
import { productPriceSummary } from "@/lib/product-filtering";

export function ProductList({
  products,
  productsLoaded,
  loadFailed,
  busyAction,
  totalFilteredCount,
  onMove,
  onToggleStatus,
  onEdit,
  onRemove,
  onCreateNew,
}: {
  products: ManagedProduct[];
  productsLoaded: boolean;
  loadFailed: boolean;
  busyAction: string | null;
  totalFilteredCount: number;
  onMove: (product: ManagedProduct, direction: -1 | 1) => void;
  onToggleStatus: (product: ManagedProduct) => void;
  onEdit: (product: ManagedProduct) => void;
  onRemove: (product: ManagedProduct) => void;
  onCreateNew?: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, currentPage, pageSize]);

  return (
    <section className="space-y-4">
      {/* List Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <h2 className="font-display text-2xl tracking-[-0.04em] text-[#294332]">
            Daftar Produk
          </h2>
          <span className="text-xs font-bold text-[#8A948C]">
            ({products.length} dari {totalFilteredCount} item)
          </span>
        </div>

        {!productsLoaded ? (
          <span className="text-xs font-bold text-[#8A948C]">Memuat data…</span>
        ) : null}
      </div>

      {/* Error state */}
      {products.length === 0 && productsLoaded && loadFailed ? (
        <div className="rounded-[2rem] border border-[#C76845]/25 bg-[#F9E7DF] p-8 text-center shadow-xs">
          <p className="font-bold text-[#8A3F23]">Daftar produk gagal dimuat.</p>
          <p className="mt-2 text-sm text-[#8A3F23]">
            Server menolak permintaan baca atau koneksi bermasalah.
          </p>
        </div>
      ) : null}

      {/* Empty state */}
      {products.length === 0 && productsLoaded && !loadFailed ? (
        <div className="rounded-[2rem] border border-dashed border-[#314B3A]/20 bg-white p-10 text-center shadow-xs">
          <p className="font-bold text-lg text-[#27372D]">Belum ada produk yang cocok.</p>
          <p className="mt-1 text-sm text-[#6B766E]">
            Tidak ada produk yang sesuai dengan kriteria pencarian atau filter aktif.
          </p>
          {onCreateNew ? (
            <Button className="mt-5" onClick={onCreateNew}>
              <Plus size={16} /> Tambah Produk Baru
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* Desktop Table View */}
      {products.length > 0 ? (
        <div className="hidden lg:block overflow-hidden rounded-[2rem] border border-[#314B3A]/12 bg-white shadow-[0_12px_36px_rgba(49,75,58,0.05)]">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-[#314B3A]/10 bg-[#F7F5EE] text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
              <tr>
                <th className="px-5 py-4 text-start">Foto</th>
                <th className="px-5 py-4 text-start">Produk</th>
                <th className="px-4 py-4 text-start">Kategori</th>
                <th className="px-4 py-4 text-start">Usia</th>
                <th className="px-4 py-4 text-start">Status</th>
                <th className="px-4 py-4 text-start">Varian & Harga</th>
                <th className="px-4 py-4 text-center">Urutan</th>
                <th className="px-5 py-4 text-end">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#314B3A]/8 text-[#27372D]">
              {paginatedProducts.map((product, idx) => {
                const published = product.status === "published";
                const busy = isBusyFor(busyAction, product.documentId);
                const globalIndex = (currentPage - 1) * pageSize + idx;
                const name = displayName(product);
                const category = product.translations.id?.category || "—";
                const age = product.translations.id?.age || "—";
                const variants = product.variants ?? [];

                return (
                  <tr key={product.documentId} className="transition hover:bg-[#FBF9F3]/80">
                    {/* Thumbnail */}
                    <td className="px-5 py-3.5">
                      <div
                        className="grid size-12 place-items-center overflow-hidden rounded-xl border border-[#314B3A]/10"
                        style={{ backgroundColor: product.surface }}
                      >
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="size-full object-cover" src={product.imageUrl} alt="" />
                        ) : (
                          <span className="font-display text-sm font-bold text-[#536459]">
                            {name.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Product Name & Slug */}
                    <td className="px-5 py-3.5 max-w-[14rem]">
                      <p className="font-bold text-[#27372D] truncate" title={name}>
                        {name}
                      </p>
                      <p className="mt-0.5 text-xs text-[#8A948C] font-mono truncate">
                        #{product.id} · /{product.slug || product.id}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5 text-xs font-semibold text-[#536459]">
                      <span className="rounded-lg bg-[#EEF1E9] px-2.5 py-1">{category}</span>
                    </td>

                    {/* Age Range */}
                    <td className="px-4 py-3.5 text-xs font-semibold text-[#536459]">
                      {age}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${
                          published
                            ? "bg-[#DFEBDC] text-[#2F5236]"
                            : "bg-[#F1EFE7] text-[#6B766E]"
                        }`}
                      >
                        {published ? "Published" : "Draft"}
                      </span>
                    </td>

                    {/* Variants & Pricing */}
                    <td className="px-4 py-3.5 text-xs">
                      {variants.length > 0 ? (
                        <div>
                          <span className="font-bold text-[#27372D]">
                            {variants.length} Varian
                          </span>
                          <p
                            className={`truncate max-w-[10rem] ${
                              productPriceSummary(product) === "Hubungi Kami"
                                ? "text-[#8A948C]"
                                : "text-[#6B766E]"
                            }`}
                          >
                            {productPriceSummary(product)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[#8A948C]">Tanpa Varian</span>
                      )}
                    </td>

                    {/* Reorder Buttons */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg text-[#536459]"
                          disabled={busy || globalIndex === 0}
                          aria-label={`Naikkan ${name}`}
                          onClick={() => onMove(product, -1)}
                        >
                          <ArrowUp size={14} />
                        </Button>
                        <span className="text-xs font-bold text-[#8A948C] w-6 text-center">
                          {product.order}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg text-[#536459]"
                          disabled={busy || globalIndex === products.length - 1}
                          aria-label={`Turunkan ${name}`}
                          onClick={() => onMove(product, 1)}
                        >
                          <ArrowDown size={14} />
                        </Button>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="px-5 py-3.5 text-end">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-xl text-[#314B3A] hover:bg-[#EEF1E9]"
                          title={published ? "Sembunyikan dari pembeli" : "Tampilkan ke pembeli"}
                          aria-label={published ? "Sembunyikan produk" : "Tampilkan produk"}
                          disabled={busy}
                          onClick={() => onToggleStatus(product)}
                        >
                          {published ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-xl px-2.5 text-xs"
                          disabled={busy}
                          onClick={() => onEdit(product)}
                        >
                          <Pencil size={13} /> Edit
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-xl text-[#B23C22] hover:bg-[#F9E7DF]"
                          title="Hapus produk"
                          aria-label={`Hapus ${name}`}
                          disabled={busy}
                          onClick={() => onRemove(product)}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Mobile / Tablet Responsive Cards */}
      {products.length > 0 ? (
        <div className="grid gap-3 lg:hidden">
          {paginatedProducts.map((product, idx) => {
            const published = product.status === "published";
            const busy = isBusyFor(busyAction, product.documentId);
            const globalIndex = (currentPage - 1) * pageSize + idx;
            const name = displayName(product);
            const category = product.translations.id?.category || "—";
            const age = product.translations.id?.age || "—";

            return (
              <article
                key={product.documentId}
                className="rounded-[1.7rem] border border-[#314B3A]/12 bg-white p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#314B3A]/10"
                    style={{ backgroundColor: product.surface }}
                  >
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="size-full object-cover" src={product.imageUrl} alt="" />
                    ) : (
                      <span className="font-display text-base font-bold text-[#536459]">
                        {name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-[#27372D] text-sm truncate">{name}</h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] ${
                          published
                            ? "bg-[#DFEBDC] text-[#2F5236]"
                            : "bg-[#F1EFE7] text-[#6B766E]"
                        }`}
                      >
                        {published ? "Published" : "Draft"}
                      </span>
                    </div>

                    <p className="mt-0.5 text-xs text-[#8A948C]">
                      #{product.id} · Kategori: {category} · Usia: {age}
                    </p>

                    {(product.variants?.length ?? 0) > 0 ? (
                      <p className="mt-1 text-xs font-bold text-[#536459]">
                        {product.variants?.length} Varian ·{" "}
                        <span
                          className={
                            productPriceSummary(product) === "Hubungi Kami"
                              ? "text-[#8A948C] font-semibold"
                              : "text-[#6B766E]"
                          }
                        >
                          {productPriceSummary(product)}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#314B3A]/8">
                  {/* Order control */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg"
                      disabled={busy || globalIndex === 0}
                      aria-label="Naikkan urutan"
                      onClick={() => onMove(product, -1)}
                    >
                      <ArrowUp size={14} />
                    </Button>
                    <span className="text-xs font-bold text-[#8A948C]">#{product.order}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg"
                      disabled={busy || globalIndex === products.length - 1}
                      aria-label="Turunkan urutan"
                      onClick={() => onMove(product, 1)}
                    >
                      <ArrowDown size={14} />
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs rounded-xl"
                      disabled={busy}
                      onClick={() => onToggleStatus(product)}
                    >
                      {published ? "Sembunyikan" : "Tampilkan"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs rounded-xl"
                      disabled={busy}
                      onClick={() => onEdit(product)}
                    >
                      <Pencil size={13} /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-xl text-[#B23C22] hover:bg-[#F9E7DF]"
                      aria-label={`Hapus ${name}`}
                      disabled={busy}
                      onClick={() => onRemove(product)}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {/* Pagination controls */}
      {totalPages > 1 ? (
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs font-bold text-[#748077]">
            Halaman {currentPage} dari {totalPages}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} /> Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Berikutnya <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
