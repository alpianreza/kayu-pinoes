"use client";

import { useLanguage } from "@/components/site/LanguageProvider";
import { type ProductVariant } from "@/lib/products";
import { siteCopy } from "@/lib/site-copy";

/**
 * Daftar varian produk (mis. ukuran) yang bisa dipilih.
 *
 * Baris varian adalah tombol pemilih, bukan tautan: memilihnya memperbarui
 * harga yang tampil dan pesan WhatsApp tombol pesan di halaman detail.
 * Harga tiap varian ditampilkan apa adanya; bila kosong, label
 * "Tanya harga" dipakai - situs tidak pernah mengarang harga sendiri.
 */
export function ProductVariants({
  variants,
  selectedIndex,
  onSelect,
  className,
}: {
  variants: ProductVariant[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}) {
  const { language } = useLanguage();
  const copy = siteCopy[language].detail;

  if (variants.length === 0) return null;

  const selected = variants[selectedIndex];
  const selectedPrice = selected?.price?.trim();

  return (
    <div className={className}>
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#C76845]">{copy.variantsTitle}</p>
      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        {variants.map((variant, index) => {
          const isActive = index === selectedIndex;
          return (
            <button
              key={`${variant.label}-${index}`}
              type="button"
              onClick={() => onSelect(index)}
              aria-pressed={isActive}
              className={`rounded-xl border px-3.5 py-2.5 text-left text-sm font-bold transition-colors ${
                isActive
                  ? "border-[#C76845] bg-[#C76845] text-white"
                  : "border-[#314B3A]/12 bg-white text-[#334139] hover:border-[#C76845]/40 hover:bg-[#FBF9F3]"
              }`}
            >
              {variant.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3 rounded-xl border border-[#314B3A]/10 bg-[#F7F5EE] px-3.5 py-3">
        <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#748077]">
          {selectedPrice ? copy.priceLabel : copy.priceFrom}
        </span>
        <span className={`text-base font-extrabold ${selectedPrice ? "text-[#314B3A]" : "text-[#C76845]"}`}>
          {selectedPrice ? selectedPrice : copy.askPrice}
        </span>
      </div>

      <p className="mt-1.5 text-xs font-medium text-[#8A948C]">{copy.variantsHint}</p>
    </div>
  );
}
