import { supportedLanguages, type Language } from "./catalog-i18n.ts";

/**
 * Bahasa bawaan situs dan normalisasi kode bahasa.
 *
 * Berkas ini sengaja TIDAK mengimpor apa pun dari `components/`, supaya bisa
 * dipakai oleh `app/layout.tsx` dan `app/sitemap.ts` (kode sisi server) tanpa
 * ikut menarik komponen klien ke dalam bundel server.
 */
export const DEFAULT_LANGUAGE: Language = "en";

/** Kode bahasa yang dikenal, atau null bila bukan bahasa situs. */
export function parseLanguage(value: string | null | undefined): Language | null {
  if (!value) return null;
  return (supportedLanguages as readonly string[]).includes(value)
    ? (value as Language)
    : null;
}

/** Kode bahasa yang dikenal, dengan jatuhan ke bawaan. */
export function normalizeLanguage(value: string | null | undefined): Language {
  return parseLanguage(value) ?? DEFAULT_LANGUAGE;
}
