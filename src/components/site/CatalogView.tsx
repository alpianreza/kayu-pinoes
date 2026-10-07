"use client";

import { useDeferredValue, useMemo } from "react";
import { Search } from "lucide-react";
import {
  parseAsString,
  parseAsStringEnum,
  useQueryState,
  useQueryStates,
} from "nuqs";

import { OrderButton } from "@/components/site/OrderButton";
import { ProductCard } from "@/components/site/ProductCard";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { useCatalogue } from "@/components/site/useCatalogue";
import { useLanguage } from "@/components/site/LanguageProvider";
import { languageDirections } from "@/lib/locale-metadata";
import { Button } from "@/components/ui/button";
import {
  ageBuckets,
  matchesAgeBucket,
  matchesQuery,
  sortOptions,
  sortProducts,
  type AgeBucket,
  type SortKey,
} from "@/lib/catalogue";
import { siteCopy } from "@/lib/site-copy";

export function CatalogView() {
  const { language } = useLanguage();
  const copy = siteCopy[language].catalog;
  const { products } = useCatalogue(language);

  // Filter hidup di URL lewat nuqs, bukan useState: tautan seperti
  // /products?q=pelangi&age=2-4 bisa dibagikan (situs ini pesan-melalui-WA),
  // bertahan saat muat ulang, dan tombol back browser terasa wajar.
  // `q` memakai history replace agar setiap ketikan tidak menambah entri
  // mundur; pilihan lain (kategori/usia/urutan) memang navigasi, jadi push.
  // Nama kunci sengaja pendek (q/cat/age/sort) dan tidak memakai `lang` yang
  // sudah dipakai untuk hreflang.
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ history: "replace", clearOnDefault: true, throttleMs: 250 }),
  );
  const [{ cat: category, age: bucket, sort }, setFilters] = useQueryStates({
    cat: parseAsString.withDefault("all"),
    age: parseAsStringEnum<AgeBucket>(["all", "0-2", "2-4", "4-6"]).withDefault("all"),
    sort: parseAsStringEnum<SortKey>(["catalog", "name", "age-youngest", "age-oldest"]).withDefault("catalog"),
  });

  // Ketikan mengetuk seluruh pipeline filter; tunda sampai browser longgar
  // sehingga input tetap terasa ringan walau katalog membesar.
  const deferredQuery = useDeferredValue(query);

  const bucketLabels: Record<AgeBucket, string> = {
    all: copy.ageAll,
    "0-2": `0–2 ${copy.ageYears}`,
    "2-4": `2–4 ${copy.ageYears}`,
    "4-6": `4–6 ${copy.ageYears}`,
  };

  const sortLabels: Record<SortKey, string> = {
    catalog: copy.sortCatalog,
    name: copy.sortName,
    "age-youngest": copy.sortYoungest,
    "age-oldest": copy.sortOldest,
  };

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );

  const visible = useMemo(() => {
    const filtered = products.filter(
      (product) =>
        (category === "all" || product.category === category) &&
        matchesAgeBucket(product.age, bucket) &&
        matchesQuery(product, deferredQuery),
    );

    return sortProducts(filtered, sort);
  }, [products, category, bucket, deferredQuery, sort]);

  const isFiltered = deferredQuery.trim().length > 0 || category !== "all" || bucket !== "all";

  function resetFilters() {
    void setQuery("");
    void setFilters({ cat: "all", age: "all", sort: "catalog" });
  }

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

        <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="rounded-[1.7rem] border border-[#314B3A]/10 bg-white p-5 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)_minmax(0,.8fr)]">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                  {copy.searchLabel}
                </span>
                <span className="relative block">
                  <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A948C]" />
                  <input
                    className="w-full rounded-xl border border-[#314B3A]/15 bg-white py-2.5 pl-10 pr-3.5 text-sm font-semibold text-[#27372D] outline-none transition focus:border-[#C76845] focus:ring-2 focus:ring-[#C76845]/25"
                    type="search"
                    value={query}
                    placeholder={copy.searchPlaceholder}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                  {copy.categoryLabel}
                </span>
                <select
                  className="w-full rounded-xl border border-[#314B3A]/15 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#27372D] outline-none transition focus:border-[#C76845] focus:ring-2 focus:ring-[#C76845]/25"
                  value={category}
                  onChange={(event) => void setFilters({ cat: event.target.value })}
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item === "all" ? copy.allCategories : item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                  {copy.sortLabel}
                </span>
                <select
                  className="w-full rounded-xl border border-[#314B3A]/15 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#27372D] outline-none transition focus:border-[#C76845] focus:ring-2 focus:ring-[#C76845]/25"
                  value={sort}
                  onChange={(event) => void setFilters({ sort: event.target.value as SortKey })}
                >
                  {sortOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {sortLabels[option.key]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#314B3A]/10 pt-4">
              <span className="mr-1 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
                {copy.ageLabel}
              </span>
              {ageBuckets.map((option) => {
                const active = bucket === option.key;
                return (
                  <button
                    key={option.key}
                    className={`min-h-9 rounded-full px-3.5 text-xs font-black transition-colors ${
                      active ? "bg-[#314B3A] text-white" : "bg-[#EEF1E9] text-[#536459] hover:text-[#314B3A]"
                    }`}
                    type="button"
                    aria-pressed={active}
                    onClick={() => void setFilters({ age: option.key })}
                  >
                    {bucketLabels[option.key]}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-[#405047]">{copy.showing(visible.length, products.length)}</p>
            {isFiltered ? (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                {copy.clearFilters}
              </Button>
            ) : null}
          </div>

          {visible.length === 0 ? (
            <div className="rounded-[1.7rem] border border-dashed border-[#314B3A]/20 bg-white p-10 text-center">
              <p className="font-display text-2xl tracking-[-0.04em] text-[#334139]">{copy.emptyTitle}</p>
              <p className="mt-3 text-sm leading-6 text-[#6B766E]">{copy.emptyBody}</p>
              <Button className="mt-6" variant="outline" onClick={resetFilters}>
                {copy.clearFilters}
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 2} />
              ))}
            </div>
          )}
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
