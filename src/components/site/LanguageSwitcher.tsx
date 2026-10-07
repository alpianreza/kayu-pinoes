"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { languageOptions, type Language } from "@/lib/catalog-i18n";
import { siteCopy } from "@/lib/site-copy";

import { useLanguage } from "./LanguageProvider";

/*
 * Bendera digambar sebagai SVG sederhana, bukan berkas resmi. Emoji bendera
 * tidak dirender di Windows, jadi SVG adalah satu-satunya cara yang bisa
 * diandalkan. Label nama bahasa di sebelahnya yang menjadi penanda utama.
 */
function Flag({ code }: { code: Language }) {
  if (code === "id") {
    return (
      <svg viewBox="0 0 60 40" className="h-3.5 w-5 shrink-0 rounded-[2px]" aria-hidden="true" focusable="false">
        <rect width="60" height="20" fill="#CE1126" />
        <rect y="20" width="60" height="20" fill="#FFFFFF" />
        <rect x="0.5" y="0.5" width="59" height="39" fill="none" stroke="rgba(20,20,20,.18)" />
      </svg>
    );
  }

  if (code === "en") {
    return (
      <svg viewBox="0 0 60 40" className="h-3.5 w-5 shrink-0 rounded-[2px]" aria-hidden="true" focusable="false">
        <rect width="60" height="40" fill="#012169" />
        <path d="M0 0 60 40 M60 0 0 40" stroke="#FFFFFF" strokeWidth="8" />
        <path d="M0 0 60 40 M60 0 0 40" stroke="#C8102E" strokeWidth="4" />
        <path d="M30 0 V40 M0 20 H60" stroke="#FFFFFF" strokeWidth="13" />
        <path d="M30 0 V40 M0 20 H60" stroke="#C8102E" strokeWidth="7" />
        <rect x="0.5" y="0.5" width="59" height="39" fill="none" stroke="rgba(20,20,20,.18)" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 60 40" className="h-3.5 w-5 shrink-0 rounded-[2px]" aria-hidden="true" focusable="false">
      <rect width="60" height="40" fill="#165D31" />
      <rect x="12" y="12.5" width="36" height="2.4" rx="1.2" fill="#FFFFFF" />
      <rect x="12" y="18.8" width="29" height="2.4" rx="1.2" fill="#FFFFFF" />
      <rect x="12" y="25.6" width="36" height="2.4" rx="1.2" fill="#FFFFFF" />
      <rect x="0.5" y="0.5" width="59" height="39" fill="none" stroke="rgba(20,20,20,.18)" />
    </svg>
  );
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const active = languageOptions.find((option) => option.code === language) ?? languageOptions[0];
  const label = siteCopy[language].header.languageControl;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        className="flex min-h-9 items-center gap-2 rounded-full border border-[#314B3A]/12 bg-[#FBF9F3]/85 px-3 text-xs font-black text-[#314B3A] transition-colors hover:bg-[#EEF1E9] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#C76845]"
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Flag code={language} />
        <span className="tracking-[0.08em]">{active.code.toUpperCase()}</span>
        <ChevronDown
          size={14}
          className={`text-[#748077] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`absolute right-0 z-40 mt-2 w-52 origin-top-right rounded-2xl border border-[#314B3A]/12 bg-white p-1.5 shadow-[0_18px_40px_rgba(31,48,37,0.16)] transition-all duration-200 ease-out ${
          open ? "visible scale-100 opacity-100" : "invisible -translate-y-1 scale-[.97] opacity-0"
        }`}
        role="listbox"
        aria-label={label}
      >
        {languageOptions.map((option) => {
          const selected = option.code === language;
          return (
            <button
              key={option.code}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-bold transition-colors ${
                selected ? "bg-[#EEF1E9] text-[#314B3A]" : "text-[#536459] hover:bg-[#F7F5EE] hover:text-[#314B3A]"
              }`}
              type="button"
              role="option"
              aria-selected={selected}
              lang={option.code}
              onClick={() => {
                setLanguage(option.code);
                setOpen(false);
              }}
            >
              <Flag code={option.code} />
              <span className="flex-1">{option.label}</span>
              {selected ? <Check size={14} className="text-[#C76845]" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
