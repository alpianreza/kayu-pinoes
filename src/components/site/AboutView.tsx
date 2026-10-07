"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ProductImage } from "@/components/site/ProductImage";
import { useLanguage } from "@/components/site/LanguageProvider";
import { useCatalogue } from "@/components/site/useCatalogue";
import { languageDirections } from "@/lib/locale-metadata";
import { Button } from "@/components/ui/button";
import { catalogueImage } from "@/lib/products";
import { siteCopy } from "@/lib/site-copy";

export function AboutView() {
  const { language } = useLanguage();
  const copy = siteCopy[language].about;
  // Jumlah produk diambil dari katalog yang sama dengan halaman publik, jadi
  // tulisan "N koleksi" di ajakan tidak tertinggal ketika admin menambah
  // atau menyembunyikan produk.
  const { products } = useCatalogue(language);

  return (
    <div lang={language} dir={languageDirections(language)} className="min-h-dvh bg-[#FBF9F3] text-[#27372D]">
      <SiteHeader active="/about" />

      <main id="content">
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-9 sm:px-8 lg:px-10 lg:pt-12">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#C76845]">{copy.eyebrow}</p>
          <h1 className="font-display max-w-3xl text-4xl leading-[1.02] tracking-[-0.055em] text-[#294332] sm:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#536459]">{copy.intro}</p>
        </section>

        <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <figure className="relative aspect-[16/9] overflow-hidden rounded-[2.2rem] border border-[#314B3A]/10 bg-[#E8EBDD]">
            <ProductImage
              src={catalogueImage}
              alt=""
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </figure>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <div className="border-y border-[#314B3A]/10 py-10">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#C76845]">{copy.processEyebrow}</p>
            <h2 className="font-display max-w-2xl text-3xl leading-[1.05] tracking-[-0.05em] text-[#294332] sm:text-4xl">
              {copy.processTitle}
            </h2>

            <div className="mt-9 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {copy.process.map((step, index) => (
                <div key={step.title}>
                  <span className="font-display text-3xl text-[#D98B64]">0{index + 1}</span>
                  <h3 className="font-display mt-2 text-xl tracking-[-0.035em] text-[#334139]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#68766D]">{step.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 lg:px-10">
          <div className="grid gap-6 sm:grid-cols-3">
            {copy.values.map((value, index) => (
              <div key={value.title} className="flex gap-4 rounded-[1.7rem] border border-[#314B3A]/10 bg-white p-6">
                <span className="font-display text-3xl text-[#D98B64]">0{index + 1}</span>
                <div>
                  <h3 className="font-display text-xl tracking-[-0.035em] text-[#334139]">{value.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#68766E]">{value.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-6 rounded-[2.2rem] bg-[#314B3A] px-7 py-10 text-[#F9F4E8] sm:flex-row sm:items-end sm:px-10">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#F4C45D]">{copy.ctaEyebrow}</p>
              <h2 className="font-display mt-3 max-w-xl text-3xl leading-[1.05] tracking-[-0.05em] sm:text-4xl">
                {copy.ctaTitle(products.length)}
              </h2>
            </div>
            <Button asChild size="lg" className="bg-[#F9F4E8] text-[#314B3A] shadow-none hover:bg-white">
              <Link href="/products">
                {copy.ctaButton} <ArrowRight size={17} />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
