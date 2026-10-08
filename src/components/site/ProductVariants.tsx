"use client";

import { useLanguage } from "@/components/site/LanguageProvider";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { type ProductVariant } from "@/lib/products";
import { siteCopy } from "@/lib/site-copy";
import { buildOrderLink } from "@/lib/whatsapp";

/**
 * Daftar varian produk (mis. ukuran) beserta harganya.
 *
 * Setiap baris adalah tautan WhatsApp: pesanan selalu diarahkan ke WhatsApp,
 * dengan nama produk dan variannya sudah tertulis di pesan. Varian tanpa harga
 * menampilkan "Tanya harga" - situs tidak pernah mengarang harga sendiri.
 */
export function ProductVariants({
  productName,
  variants,
  className,
}: {
  productName: string;
  variants: ProductVariant[];
  className?: string;
}) {
  const { language } = useLanguage();
  const copy = siteCopy[language].detail;

  if (variants.length === 0) return null;

  return (
    <div className={className}>
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#C76845]">{copy.variantsTitle}</p>
      <ul className="mt-2.5 grid gap-1.5">
        {variants.map((variant, index) => {
          const href = buildOrderLink(productName, language, variant.label);
          const rowClass =
            "flex items-center justify-between gap-3 rounded-xl border border-[#314B3A]/12 bg-white px-3.5 py-2.5";
          const body = (
            <>
              <span className="text-sm font-bold text-[#334139]">{variant.label}</span>
              <span className="flex shrink-0 items-center gap-2 text-[13px] font-semibold">
                {variant.price ? (
                  <span className="text-[#314B3A]">{variant.price}</span>
                ) : (
                  <span className="text-[#8A948C]">{copy.askPrice}</span>
                )}
                <WhatsAppIcon size={16} />
              </span>
            </>
          );

          return (
            <li key={`${variant.label}-${index}`}>
              {href ? (
                <a
                  className={`${rowClass} transition hover:border-[#C76845]/40 hover:bg-[#FBF9F3]`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {body}
                </a>
              ) : (
                <div className={rowClass}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-1.5 text-xs font-medium text-[#8A948C]">{copy.variantsHint}</p>
    </div>
  );
}
