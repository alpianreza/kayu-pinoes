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
  // Harga ringkas untuk kartu: varian pertama yang punya harga. Bila belum
  // ada harga sama sekali, kartu menampilkan "Tanya harga" - situs tidak
  // pernah mengarang angka.
  const priceText =
    (product.variants ?? []).find((variant) => variant.price.trim().length > 0)?.price.trim() ?? "";

  return (
    <article className="kp-card group flex min-w-0 flex-col overflow-hidden rounded-[1.25rem] border border-[#314B3A]/10 bg-white sm:rounded-[1.7rem] transition-transform duration-200 hover:-translate-y-1">
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
            sizes="(max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <ProductPlaceholder product={product} />
        )}
        {/* start-4 bukan left-4: lencana usia menempel di tepi awal baris,
            jadi di bahasa Arab ia berpindah ke kanan mengikuti arah baca. */}
        <span className="absolute start-2.5 top-2.5 rounded-full bg-[#FBF9F3]/90 px-2 py-1 text-[9px] sm:start-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[10px] font-black uppercase tracking-[0.1em] text-[#526259]">
          {product.age}
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-3.5 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
        <p className="text-[10px] font-bold text-[#748077] sm:text-xs">{product.category}</p>
        <h3 className="mt-1 font-display text-base leading-snug tracking-[-0.04em] text-[#334139] sm:text-xl">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-[#68766D] sm:mt-2 sm:line-clamp-3 sm:text-sm sm:leading-6">{product.description}</p>

        <p className="mt-3 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 border-t border-[#314B3A]/10 pt-2.5 sm:mt-4 sm:pt-3">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#748077] sm:text-xs">
            {copy.priceLabel}
          </span>
          <span className={`text-sm font-extrabold sm:text-base ${priceText ? "text-[#314B3A]" : "text-[#C76845]"}`}>
            {priceText || copy.askPrice}
          </span>
        </p>

        <Button asChild className="mt-3.5 w-full sm:mt-5" variant="outline" size="sm">
          <Link href={`/products/${product.slug}`}>
            {copy.viewDetails} <ArrowRight className={arrowClass} size={15} />
          </Link>
        </Button>
      </div>
    </article>
  );
}
