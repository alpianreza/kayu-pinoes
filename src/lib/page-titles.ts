import type { Language } from "./catalog-i18n.ts";

/**
 * Judul tab per bahasa.
 *
 * Metadata statis di tiap halaman tetap dipakai untuk render awal (bahasa
 * default) dan mesin pencari; komponen DocumentTitle memperbarui judul di
 * browser begitu bahasa berganti, dan halaman detail produk mengurus
 * judulnya sendiri mengikuti nama produk.
 */
export const pageTitles: Record<
  Language,
  { catalog: string; about: string; contact: string }
> = {
  id: {
    catalog: "Katalog — Kayu Pinoes",
    about: "Tentang — Kayu Pinoes",
    contact: "Kontak & Cara Memesan — Kayu Pinoes",
  },
  en: {
    catalog: "Catalog — Kayu Pinoes",
    about: "About — Kayu Pinoes",
    contact: "Contact & how to order — Kayu Pinoes",
  },
  ar: {
    catalog: "الكتالوج — Kayu Pinoes",
    about: "من نحن — Kayu Pinoes",
    contact: "الاتصال والطلب — Kayu Pinoes",
  },
};
