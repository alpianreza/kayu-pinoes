"use client";

import { siteCopy } from "@/lib/site-copy";

import { BrandLockup } from "./BrandLockup";

import { useLanguage } from "./LanguageProvider";

/** Footer tunggal untuk seluruh situs, bentuknya sama dengan halaman depan. */
export function SiteFooter() {
  const { language } = useLanguage();
  const copy = siteCopy[language].footer;

  return (
    <footer className="bg-[#F0EEE5] px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-7 sm:flex-row sm:items-end">
        <div>
          <BrandLockup />
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#6B766E]">{copy.description}</p>
        </div>
        <p className="text-xs font-bold text-[#7D887F]">{copy.copyright}</p>
      </div>
    </footer>
  );
}
