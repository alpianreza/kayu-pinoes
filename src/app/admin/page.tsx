"use client";

import Link from "next/link";
import {
  FolderTree,
  Image as ImageIcon,
  Layers,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  subscribeToManagedProducts,
  type ManagedProduct,
} from "@/lib/supabase-products";
import { toMessage } from "@/lib/product-form";

import { KpiCard } from "./_components/KpiCard";
import { Notice } from "./_components/Notice";

export default function AdminDashboardPage() {
  const [managedProducts, setManagedProducts] = useState<ManagedProduct[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToManagedProducts(
      (nextProducts) => {
        setManagedProducts(nextProducts);
        setProductsLoaded(true);
        setErrorNotice(null);
      },
      (err) => {
        setErrorNotice(toMessage(err));
        setProductsLoaded(true);
      }
    );
  }, []);

  // Compute stats
  const totalCount = managedProducts.length;
  const publishedCount = useMemo(
    () => managedProducts.filter((p) => p.status === "published").length,
    [managedProducts]
  );
  const draftCount = useMemo(
    () => managedProducts.filter((p) => p.status === "draft").length,
    [managedProducts]
  );
  const withImageCount = useMemo(
    () => managedProducts.filter((p) => Boolean(p.imageUrl || p.imagePath)).length,
    [managedProducts]
  );

  // Recent products (latest 5)
  const recentProducts = useMemo(() => {
    return [...managedProducts]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  }, [managedProducts]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#C76845]">
            Ringkasan Katalog
          </span>
          <h1 className="font-display text-3xl tracking-[-0.05em] text-[#294332] sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#6B766E]">
            Selamat datang di CMS Katalog Kayu Pinoes. Kelola produk, kategori, dan master data.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="default">
            <Link href="/admin/products?action=new">
              <Plus size={16} /> Tambah Produk
            </Link>
          </Button>
        </div>
      </div>

      {errorNotice ? <Notice kind="error">{errorNotice}</Notice> : null}

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Produk"
          value={totalCount}
          description="Seluruh produk terdaftar"
          icon={<Package size={20} />}
          accentColor="#314B3A"
          loading={!productsLoaded}
        />
        <KpiCard
          title="Tampil di Situs"
          value={publishedCount}
          description="Dilihat oleh pembeli"
          icon={<ShoppingBag size={20} />}
          accentColor="#527A58"
          loading={!productsLoaded}
        />
        <KpiCard
          title="Disimpan saja (Draft)"
          value={draftCount}
          description="Belum dipublikasikan"
          icon={<Sparkles size={20} />}
          accentColor="#C76845"
          loading={!productsLoaded}
        />
        <KpiCard
          title="Produk Berfoto"
          value={withImageCount}
          description="Memiliki gambar produk"
          icon={<ImageIcon size={20} />}
          accentColor="#8A5A2B"
          loading={!productsLoaded}
        />
      </div>

      {/* Main Section: Quick Actions & Recent Products */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Products (2 Cols) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-[-0.04em] text-[#27372D]">
              Produk Terbaru
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/products">Lihat Semua ({totalCount})</Link>
            </Button>
          </div>

          <div className="rounded-[2rem] border border-[#314B3A]/12 bg-white p-5 shadow-[0_12px_36px_rgba(49,75,58,0.05)]">
            {!productsLoaded ? (
              <div className="py-8 text-center text-sm font-semibold text-[#8A948C]">
                Memuat daftar produk…
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="py-8 text-center">
                <p className="font-bold text-[#405047]">Belum ada produk tersimpan.</p>
                <p className="mt-1 text-xs text-[#6B766E]">
                  Tambahkan produk pertama kamu ke katalog.
                </p>
                <Button asChild className="mt-4" size="sm">
                  <Link href="/admin/products?action=new">
                    <Plus size={14} /> Tambah Produk Pertama
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[#314B3A]/8">
                {recentProducts.map((product) => {
                  const published = product.status === "published";
                  const name = product.translations.id?.name || `Produk #${product.id}`;

                  return (
                    <div
                      key={product.documentId}
                      className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl"
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

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-[#27372D] text-sm">{name}</p>
                          <p className="mt-0.5 text-xs text-[#8A948C]">
                            ID: #{product.id} · Order: {product.order}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${
                            published
                              ? "bg-[#DFEBDC] text-[#2F5236]"
                              : "bg-[#F1EFE7] text-[#6B766E]"
                          }`}
                        >
                          {published ? "Published" : "Draft"}
                        </span>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/products?edit=${product.documentId}`}>Edit</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Navigation Cards (1 Col) */}
        <div className="space-y-4">
          <h2 className="font-display text-2xl tracking-[-0.04em] text-[#27372D]">
            Aksi Cepat
          </h2>

          <div className="grid gap-3">
            <Link
              href="/admin/products?action=new"
              className="flex items-center gap-4 rounded-2xl border border-[#314B3A]/12 bg-white p-4 shadow-xs transition hover:border-[#314B3A]/30 hover:bg-[#F7F3EB]"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#314B3A] text-white">
                <Plus size={18} />
              </div>
              <div>
                <p className="font-bold text-[#27372D] text-sm">Tambah Produk Baru</p>
                <p className="text-xs text-[#6B766E]">Buat item katalog kayu baru</p>
              </div>
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center gap-4 rounded-2xl border border-[#314B3A]/12 bg-white p-4 shadow-xs transition hover:border-[#314B3A]/30 hover:bg-[#F7F3EB]"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#C76845] text-white">
                <FolderTree size={18} />
              </div>
              <div>
                <p className="font-bold text-[#27372D] text-sm">Kelola Kategori</p>
                <p className="text-xs text-[#6B766E]">Atur kategori & terjemahan</p>
              </div>
            </Link>

            <Link
              href="/admin/master-data"
              className="flex items-center gap-4 rounded-2xl border border-[#314B3A]/12 bg-white p-4 shadow-xs transition hover:border-[#314B3A]/30 hover:bg-[#F7F3EB]"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#8A5A2B] text-white">
                <Layers size={18} />
              </div>
              <div>
                <p className="font-bold text-[#27372D] text-sm">Master Data Relasional</p>
                <p className="text-xs text-[#6B766E]">Kayu, Finishing, & Rentang Usia</p>
              </div>
            </Link>

            <Link
              href="/products"
              target="_blank"
              className="flex items-center gap-4 rounded-2xl border border-[#314B3A]/12 bg-[#EEF1E9] p-4 transition hover:bg-[#E3EDE1]"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#527A58] text-white">
                <ShoppingBag size={18} />
              </div>
              <div>
                <p className="font-bold text-[#27372D] text-sm">Pratinjau Situs Publik</p>
                <p className="text-xs text-[#6B766E]">Lihat tampilan website pembeli</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
