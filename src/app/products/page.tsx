import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogView } from "@/components/site/CatalogView";
import { OrderButton } from "@/components/site/OrderButton";
import { ProductCard } from "@/components/site/ProductCard";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getLocalizedProducts } from "@/lib/catalog-i18n";
import { ageBuckets, sortOptions, type SortKey } from "@/lib/catalogue";
import { DEFAULT_LANGUAGE } from "@/lib/i18n";
import { languageAlternates, languageDirections, languageMetadata } from "@/lib/locale-metadata";
import { siteCopy } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: "Catalog — Kayu Pinoes",
  description:
    "Every Kayu Pinoes wooden toy in one place: material, dimensions, finish, and what comes in each set.",
  alternates: {
    canonical: "/products",
    languages: languageAlternates("/products"),
  },
  openGraph: {
    url: "/products",
    title: "Catalog — Kayu Pinoes",
    description:
      "Every Kayu Pinoes wooden toy in one place: material, dimensions, finish, and what comes in each set.",
    locale: languageMetadata[DEFAULT_LANGUAGE].ogLocale,
  },
};

/**
 * Sampul katalog yang benar-benar dirender di server.
 *
 * CatalogView memakai nuqs (membaca searchParams), jadi Next men-suspend
 * boundary-nya di server dan hanya fallback ini yang ikut ter-prerender.
 * Kalau fallback-nya kerangka kosong, crawler dan pengunjung tanpa JavaScript
 * tidak melihat satu pun produk. Karena itu fallback diisi katalog statis yang
 * sebenarnya: judul, kisi produk, band pesan - memakai DEFAULT_LANGUAGE.
 * Begitu JavaScript aktif, CatalogView menggantikan seluruh isi ini, jadi
 * markup statis di bawah cukup untuk mesin pencari, tidak perlu interaktif.
 */
function CatalogFallback() {
  const language = DEFAULT_LANGUAGE;
  const copy = siteCopy[language].catalog;
  const products = getLocalizedProducts(language);
  const categories = Array.from(new Set(products.map((product) => product.category)));
  const sortLabels: Record<SortKey, string> = {
    catalog: copy.sortCatalog,
    name: copy.sortName,
    "age-youngest": copy.sortYoungest,
    "age-oldest": copy.sortOldest,
  };
  const bucketLabels: Record<string, string> = {
    all: copy.ageAll,
    "0-2": `0-2 ${copy.ageYears}`,
    "2-4": `2-4 ${copy.ageYears}`,
    "4-6": `4-6 ${copy.ageYears}`,
  };

  return (
    <div lang={language} dir={languageDirections(language)} className="min-h-dvh bg-[#FBF9F3] text-[#27372D]">
      <SiteHeader active="/products" />

      <main id="content">
        <section className="mx-auto max-w-7xl px-5 pb-7 pt-9 sm:px-8 lg:px-10 lg:pt-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#C76845]">{copy.eyebrow}</p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl leading-[1.02] tracking-[-0.055em] text-[#294332] sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-[#536459]">{copy.intro}</p>
        </section>

        {/* Panel filter statis: meniru bentuk aslinya supaya tidak ada lompatan
            tata letak saat CatalogView mengambil alih. Tidak interaktif memang -
            ia hanya kerangka untuk crawler & render awal. */}
        <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10" aria-hidden="true">
          <div className="rounded-[1.7rem] border border-[#314B3A]/10 bg-white p-5 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)_minmax(0,.8fr)]">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                  {copy.searchLabel}
                </span>
                <input className="w-full rounded-xl border border-[#314B3A]/15 bg-white py-2.5 pl-3.5 pr-3.5 text-sm font-semibold text-[#27372D]" type="search" placeholder={copy.searchPlaceholder} readOnly tabIndex={-1} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                  {copy.categoryLabel}
                </span>
                <select className="w-full rounded-xl border border-[#314B3A]/15 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#27372D]" tabIndex={-1}>
                  <option>{copy.allCategories}</option>
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                  {copy.sortLabel}
                </span>
                <select className="w-full rounded-xl border border-[#314B3A]/15 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#27372D]" tabIndex={-1}>
                  {sortOptions.map((option) => (
                    <option key={option.key}>{sortLabels[option.key]}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#314B3A]/10 pt-4">
              <span className="mr-1 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">{copy.ageLabel}</span>
              {ageBuckets.map((option) => (
                <span key={option.key} className="min-h-9 rounded-full px-3.5 py-2 text-xs font-black bg-[#EEF1E9] text-[#536459]">
                  {bucketLabels[option.key]}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-[#405047]">{copy.showing(products.length, products.length)}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 2} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
          <div className="rounded-[2.2rem] bg-[#314B3A] px-7 py-10 text-[#F9F4E8] sm:px-10">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#F4C45D]">{copy.orderEyebrow}</p>
                <h2 className="font-display mt-3 max-w-xl text-3xl leading-[1.05] tracking-[-0.05em] sm:text-4xl">
                  {copy.orderTitle}
                </h2>
                <p className="mt-4 max-w-lg leading-7 text-[#D9E1D5]">{copy.orderBody}</p>
              </div>
              <OrderButton className="bg-[#F9F4E8] text-[#314B3A] shadow-none hover:bg-white" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function CatalogPage() {
  // Suspense WAJIB ada: hook nuqs di dalam CatalogView membaca searchParams,
  // dan Next menolak halaman statis yang membacanya tanpa batas Suspense
  // (build gagal dengan "missing-suspense-with-csr-bailout" tanpa ini).
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogView />
    </Suspense>
  );
}
