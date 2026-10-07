"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { siteCopy } from "@/lib/site-copy";

import { BrandLockup } from "./BrandLockup";

import { ContactButton } from "./ContactButton";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";

/**
 * Header tunggal untuk seluruh situs - bentuknya sama dengan header halaman
 * depan, dipakai di semua halaman supaya tidak ada perbedaan tampilan.
 */
export function SiteHeader({ active }: { active?: string }) {
  const { language } = useLanguage();
  const copy = siteCopy[language].header;
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/products", label: copy.catalog },
    { href: "/about", label: copy.about },
    { href: "/contact", label: copy.contact },
  ];

  return (
    <>
      <a className="skip-link" href="#content">
        {copy.skipToContent}
      </a>

      <header className="sticky top-0 z-30 border-b border-[#314B3A]/8 bg-[#FBF9F3]/95 backdrop-blur-md">
        <div className="mx-auto flex h-19 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <BrandLockup />

          <div className="hidden items-center gap-7 md:flex">
            <nav className="flex items-center gap-7 text-sm font-bold text-[#435349]" aria-label={copy.languageControl}>
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active === item.href ? "page" : undefined}
                  className={
                    active === item.href
                      ? "transition-colors text-[#C76845]"
                      : "transition-colors hover:text-[#C76845]"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <LanguageSwitcher />
            <ContactButton compact />
          </div>

          <button
            className="grid size-11 place-items-center rounded-full transition-colors hover:bg-[#EEF1E9] md:hidden"
            aria-label={open ? copy.closeMenu : copy.openMenu}
            aria-expanded={open}
            type="button"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={21} /> : <Menu size={22} />}
          </button>
        </div>

        {open ? (
          <nav className="border-t border-[#314B3A]/8 bg-[#FBF9F3] px-5 py-5 md:hidden" aria-label="Menu">
            <div className="mx-auto grid max-w-7xl gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-4 py-3 font-bold hover:bg-[#EEF1E9] ${
                    active === item.href ? "text-[#C76845]" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-3 grid gap-3 border-t border-[#314B3A]/10 pt-4">
                <LanguageSwitcher />
                <ContactButton />
              </div>
            </div>
          </nav>
        ) : null}
      </header>
    </>
  );
}
