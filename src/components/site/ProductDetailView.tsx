"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { OrderButton } from "@/components/site/OrderButton";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductImage } from "@/components/site/ProductImage";
import { ProductVariants } from "@/components/site/ProductVariants";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { useCatalogue } from "@/components/site/useCatalogue";
import { useLanguage } from "@/components/site/LanguageProvider";
import { languageDirections } from "@/lib/locale-metadata";
import { Button } from "@/components/ui/button";
import { siteCopy } from "@/lib/site-copy";

export function ProductDetailView({ slug }: { slug: string }) {
  const { language } = useLanguage();
  const copy = siteCopy[language].detail;
  const { products } = useCatalogue(language);
  // Chevron navigasi perlu diputar saat membaca dari kanan ke kiri.
  const chevronClass = language === "ar" ? "rotate-180" : undefined;

  // Alamat dicari lewat slug; angka tetap diterima supaya dokumen Firestore
  // yang memakai nama dokumen berupa angka tidak kehilangan halamannya.
  const product =
    products.find((item) => item.slug === slug) ??
    products.find((item) => String(item.id) === slug) ??
    null;

  if (!product) {
    return (
      <div lang={language} dir={languageDirections(language)} className="min-h-dvh bg-[#FBF9F3] text-[#27372D]">
        <SiteHeader active="/products" />
        <main id="content" className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <div className="rounded-[2rem] border border-[#314B3A]/12 bg-white p-8 text-center sm:p-10">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#C76845]">{copy.notFoundEyebrow}</p>
            <h1 className="font-display mt-4 text-3xl tracking-[-0.05em] text-[#294332] sm:text-4xl">
              {copy.notFoundTitle}
            </h1>
            <p className="mt-4 leading-7 text-[#536459]">{copy.notFoundBody}</p>
            <Button asChild className="mt-7">
              <Link href="/products">{copy.notFoundCta}</Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const others = products.filter((item) => item.id !== product.id).slice(0, 3);

  const specs: Array<[string, string]> = [
    [copy.specs.age, product.age],
    [copy.specs.wood, product.wood],
    [copy.specs.dimensions, product.dimensions],
    [copy.specs.finish, product.finish],
    [copy.specs.contents, product.contents],
    [copy.specs.care, product.care],
  ];

  return (
    <div lang={language} dir={languageDirections(language)} className="min-h-dvh bg-[#FBF9F3] text-[#27372D]">
      <SiteHeader active="/products" />

      <main id="content">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-5 pt-7 sm:px-8 lg:px-10">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-[#8A948C]">
            <li>
              <Link className="transition-colors hover:text-[#C76845]" href="/">
                {copy.home}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className={chevronClass} size={13} />
            </li>
            <li>
              <Link className="transition-colors hover:text-[#C76845]" href="/products">
                {copy.catalog}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className={chevronClass} size={13} />
            </li>
            <li className="text-[#405047]" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
            <figure
              className="relative aspect-square overflow-hidden rounded-[2rem] border border-[#314B3A]/10"
              style={{ backgroundColor: product.surface }}
            >
              {product.imageUrl ? (
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="grid size-full place-items-center">
                  <span
                    className="grid size-28 place-items-center rounded-[2rem] text-5xl font-black text-white/90"
                    style={{ backgroundColor: product.accent }}
                  >
                    {product.name.slice(0, 1).toUpperCase()}
                  </span>
                </div>
              )}
            </figure>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#C76845]">{product.category}</p>
              <h1 className="font-display mt-3 text-4xl leading-[1.02] tracking-[-0.055em] text-[#294332] sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-5 max-w-md leading-7 text-[#536459]">{product.description}</p>

              {product.variants && product.variants.length > 0 ? (
                <ProductVariants className="mt-6" productName={product.name} variants={product.variants} />
              ) : null}

              <dl className="mt-7 grid grid-cols-1 border-t border-[#314B3A]/10 sm:grid-cols-2">
                {specs.map(([label, value], index) => (
                  <div
                    key={label}
                    className={`border-b border-[#314B3A]/10 py-4 ${
                      index % 2 === 0 ? "sm:pr-5" : "sm:border-l sm:border-[#314B3A]/10 sm:pl-5"
                    }`}
                  >
                    <dt className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">{label}</dt>
                    <dd className="mt-1.5 text-sm font-semibold leading-5 text-[#405047]">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <OrderButton productName={product.name} />
                <Button asChild variant="outline" size="lg">
                  <Link href="/products">
                    <ArrowLeft size={16} /> {copy.backToCatalog}
                  </Link>
                </Button>
              </div>

            </div>
          </div>
        </section>

        {others.length > 0 ? (
          <section className="mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-8 lg:px-10">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-t border-[#314B3A]/10 pt-8">
              <div>
                <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#C76845]">{copy.moreEyebrow}</p>
                <h2 className="font-display text-3xl tracking-[-0.05em] text-[#294332] sm:text-4xl">{copy.moreTitle}</h2>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/products">{copy.allProducts}</Link>
              </Button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}
