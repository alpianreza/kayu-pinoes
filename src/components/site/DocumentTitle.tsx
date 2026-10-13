"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useLanguage } from "@/components/site/LanguageProvider";
import { pageTitles } from "@/lib/page-titles";

/**
 * Menyesuaikan judul tab browser dengan bahasa yang sedang dipilih.
 *
 * Halaman yang tidak terdaftar di sini (mis. halaman detail produk)
 * mengelola judulnya sendiri.
 */
export function DocumentTitle() {
  const pathname = usePathname();
  const { language } = useLanguage();

  useEffect(() => {
    const titles = pageTitles[language];

    if (pathname === "/products") {
      document.title = titles.catalog;
    } else if (pathname === "/about") {
      document.title = titles.about;
    } else if (pathname === "/contact") {
      document.title = titles.contact;
    } else if (pathname === "/gallery") {
      document.title = titles.gallery;
    }
  }, [pathname, language]);

  return null;
}
