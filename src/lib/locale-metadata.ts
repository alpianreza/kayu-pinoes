import type { Language } from "./catalog-i18n.ts";

/**
 * Metadata bahasa untuk tag `<html>`, peta situs, dan `alternates.languages`.
 *
 * Sumber teks situs (site-copy, catalog-i18n) TIDAK ikut diimpor ke sini supaya
 * modul ini tetap ringan dipakai berkas sisi server seperti layout dan sitemap.
 *
 * `hreflang` memakai kode BCP 47: `ar` sudah benar apa adanya (Arab modern),
 * `en` disamakan dengan varian en-US karena konsistensi satu nilai lebih berguna
 * untuk mesin pencari daripada pembedaan ejaan.
 */
export const languageMetadata: Record<Language, { hreflang: string; ogLocale: string }> = {
  id: { hreflang: "id", ogLocale: "id_ID" },
  en: { hreflang: "en", ogLocale: "en_US" },
  ar: { hreflang: "ar", ogLocale: "ar_AR" },
};

export function languageDirections(language: Language): "rtl" | "ltr" {
  return language === "ar" ? "rtl" : "ltr";
}

/**
 * Versi bahasa dari satu alamat, untuk `alternates.languages`.
 *
 * Situs ini melayani tiga bahasa dari satu alamat: pilihan bahasa disimpan di
 * browser dan bisa dipaksa lewat `?lang=`. Hreflang karena itu menunjuk ke
 * alamat yang sama dengan parameter itu, bukan ke subfolder yang tidak ada.
 */
export function languageAlternates(path: string): Record<string, string> {
  // Alamat sudah punya query sendiri? Pakai "&", bukan "?".
  const separator = path.includes("?") ? "&" : "?";
  return Object.fromEntries(
    Object.values(languageMetadata).map((meta) => [
      meta.hreflang,
      `${path}${separator}lang=${meta.hreflang}`,
    ]),
  );
}
