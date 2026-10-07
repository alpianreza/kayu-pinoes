"use client";

import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { type ManagedProduct } from "@/lib/supabase-products";
import { displayName, isBusyFor } from "@/lib/product-form";

export function ProductList({
  products,
  productsLoaded,
  loadFailed,
  busyAction,
  onMove,
  onToggleStatus,
  onEdit,
  onRemove,
}: {
  products: ManagedProduct[];
  productsLoaded: boolean;
  /** Permintaan baca ditolak atau gagal - daftar kosong belum tentu berarti koleksinya kosong. */
  loadFailed: boolean;
  busyAction: string | null;
  onMove: (product: ManagedProduct, direction: -1 | 1) => void;
  onToggleStatus: (product: ManagedProduct) => void;
  onEdit: (product: ManagedProduct) => void;
  onRemove: (product: ManagedProduct) => void;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl tracking-[-0.045em] text-[#294332]">
          Produk kamu
          {loadFailed ? null : (
            <span className="ml-2 align-middle text-sm font-bold text-[#8A948C]">({products.length})</span>
          )}
        </h2>
        {!productsLoaded ? <span className="text-xs font-bold text-[#8A948C]">Memuat…</span> : null}
      </div>

      {products.length === 0 && productsLoaded && loadFailed ? (
        <div className="mt-5 rounded-[1.7rem] border border-[#C76845]/25 bg-[#F9E7DF] p-8 text-center">
          <p className="font-bold text-[#8A3F23]">Daftar produk gagal dimuat.</p>
          <p className="mt-2 text-sm text-[#8A3F23]">
            Server menolak permintaan baca — biasanya izin belum dipasang. Ini belum pasti berarti datanya kosong.
          </p>
        </div>
      ) : null}

      {products.length === 0 && productsLoaded && !loadFailed ? (
        <div className="mt-5 rounded-[1.7rem] border border-dashed border-[#314B3A]/20 bg-white p-8 text-center">
          <p className="font-bold text-[#405047]">Belum ada produk tersimpan.</p>
          <p className="mt-2 text-sm text-[#6B766E]">
            Klik Tambah produk untuk membuat produk pertama.
          </p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3">
        {products.map((product, index) => {
          const published = product.status === "published";
          const busy = isBusyFor(busyAction, product.documentId);

          return (
            <article
              key={product.documentId}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#314B3A]/12 bg-white p-4"
            >
              <div
                className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl"
                style={{ backgroundColor: product.surface }}
              >
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="size-full object-cover" src={product.imageUrl} alt="" />
                ) : (
                  // Huruf dari NAMA produk, bukan dari kunci ilustrasi -
                  // "blocks"/"boneka"/"b" tidak berarti apa-apa bagi admin,
                  // sedangkan huruf pertama nama konsisten dengan kartu publik.
                  <span className="font-display text-lg text-[#536459]">
                    {displayName(product).slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-[12rem] flex-1">
                <p className="font-bold text-[#2F4136]">{displayName(product)}</p>
                <p className="mt-1 text-xs font-semibold text-[#8A948C]">
                  nomor {product.id} · tampil di posisi {index + 1}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] ${
                  published ? "bg-[#DFEBDC] text-[#2F5236]" : "bg-[#F1EFE7] text-[#6B766E]"
                }`}
              >
                {published ? "Tampil di situs" : "Disimpan saja"}
              </span>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy || index === 0}
                  aria-label={`Naikkan urutan ${displayName(product)}`}
                  onClick={() => onMove(product, -1)}
                >
                  <ArrowUp size={15} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy || index === products.length - 1}
                  aria-label={`Turunkan urutan ${displayName(product)}`}
                  onClick={() => onMove(product, 1)}
                >
                  <ArrowDown size={15} />
                </Button>
                <Button variant="outline" size="sm" disabled={busy} onClick={() => onToggleStatus(product)}>
                  {published ? "Sembunyikan" : "Tampilkan"}
                </Button>
                <Button variant="outline" size="sm" disabled={busy} onClick={() => onEdit(product)}>
                  <Pencil size={15} /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#B23C22] hover:bg-[#F9E7DF]"
                  disabled={busy}
                  onClick={() => onRemove(product)}
                >
                  <Trash2 size={15} /> Hapus
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
