"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { supportedLanguages, type Language } from "@/lib/catalog-i18n";
import { DEFAULT_LANGUAGE, parseLanguage } from "@/lib/i18n";
import { languageDirections } from "@/lib/locale-metadata";

const STORAGE_KEY = "kayu-pinoes-language";

// Bahasa bawaan hidup di `src/lib/i18n.ts` supaya kode sisi server (layout,
// peta situs) bisa memakainya tanpa ikut menarik komponen klien. Diekspor ulang
// di sini agar pemanggil lama tetap bekerja.
export { DEFAULT_LANGUAGE };

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (supportedLanguages as readonly string[]).includes(value);
}

/**
 * Menyimpan pilihan bahasa untuk seluruh situs.
 *
 * Pilihan bertahan saat berpindah halaman (tanpa muat ulang) dan disimpan di
 * localStorage, sehingga tetap sama setelah halaman dimuat ulang.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    // `?lang=` didahulukan supaya tautan berbahasa tertentu (dan hreflang di
    // peta situs) benar-benar menyajikan bahasa itu. Query dibaca dari
    // `window.location`, bukan useSearchParams, agar halaman tetap bisa
    // dirender statis tanpa Suspense.
    const fromUrl = parseLanguage(new URLSearchParams(window.location.search).get("lang"));
    if (fromUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- query dan penyimpanan hanya bisa dibaca setelah mount
      setLanguage(fromUrl);
      return;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLanguage(stored)) {
        setLanguage(stored);
      }
    } catch {
      // localStorage bisa diblokir; bahasa tetap memakai default.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Abaikan kegagalan penyimpanan.
    }

    // Tag <html> diset di sini karena nilai awalnya sudah dirender server.
    // Halaman-halaman situs juga memasang lang/dir di elemen akarnya sendiri,
    // sehingga gaya `:lang(ar)` bekerja sejak render pertama dan tidak
    // bergantung pada satu tag yang diperbarui setelah mount.
    document.documentElement.lang = language;
    document.documentElement.dir = languageDirections(language);
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage harus dipakai di dalam LanguageProvider");
  }
  return context;
}
