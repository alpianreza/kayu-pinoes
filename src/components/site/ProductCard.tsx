"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductImage } from "@/components/site/ProductImage";
import { useLanguage } from "@/components/site/LanguageProvider";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/products";
import { siteCopy } from "@/lib/site-copy";

/** Placeholder for a product that has no photo at all. */
function ProductPlaceholder({ product }: { product: Product }) {
  return (
    <div
      aria-hidden="true"
      className="grid size-full place-items-center"
      style={{ backgroundColor: product.surface }}
    >
      <span
        className="grid size-20 place-items-center rounded-[1.4rem] text-3xl font-black text-white/90"
        style={{ backgroundColor: product.accent }}
      >
        {product.name.slice(0, 1).toUpperCase()}
      </span>
    </div>
  );
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { language } = useLanguage();
  const copy = siteCopy[language].detail;
  // Arah panah ikut arah baca: di RTL "selanjutnya" berarti ke kiri.
  const arrowClass = language === "ar" ? "rotate-180" : undefined;

  return (
    <article className="kp-card group flex min-w-0 flex-col overflow-hidden rounded-[1.7rem] border border-[#314B3A]/10 bg-white transition-transform duration-200 hover:-translate-y-1">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[1/1.05] overflow-hidden"
        style={{ backgroundColor: product.surface }}
        aria-label={`${copy.viewDetails}: ${product.name}`}
      >
        {product.imageUrl ? (
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <ProductPlaceholder product={product} />
        )}
        {/* start-4 bukan left-4: lencana usia menempel di tepi awal baris,
            jadi di bahasa Arab ia berpindah ke kanan mengikuti arah baca. */}
        <span className="absolute start-4 top-4 rounded-full bg-[#FBF9F3]/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#526259]">
          {product.age}
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <p className="text-xs font-bold text-[#748077]">{product.category}</p>
        <h3 className="mt-1 font-display text-xl tracking-[-0.04em] text-[#334139]">{product.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#68766D]">{product.description}</p>

        <dl className="mt-4 grid gap-1 border-t border-[#314B3A]/10 pt-3 text-xs text-[#536459]">
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 font-bold text-[#748077]">{copy.specs.wood}</dt>
            <dd className="font-semibold">{product.wood}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 font-bold text-[#748077]">{copy.specs.dimensions}</dt>
            <dd className="font-semibold">{product.dimensions}</dd>
          </div>
        </dl>

        <Button asChild className="mt-5 w-full" variant="outline" size="sm">
          <Link href={`/products/${product.slug}`}>
            {copy.viewDetails} <ArrowRight className={arrowClass} size={15} />
          </Link>
        </Button>
      </div>
    </article>
  );
}
