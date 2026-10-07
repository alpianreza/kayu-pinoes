"use client";

import { useLanguage } from "@/components/site/LanguageProvider";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { siteCopy } from "@/lib/site-copy";
import { buildOrderLink } from "@/lib/whatsapp";

/**
 * Tombol "Hubungi Kami" dengan lambang WhatsApp.
 *
 * Saat ditekan, langsung membuka percakapan WhatsApp dengan pesan yang sudah
 * terisi. Tidak dirender sama sekali bila nomor WhatsApp belum dikonfigurasi.
 */
export function ContactButton({ compact = false }: { compact?: boolean }) {
  const { language } = useLanguage();
  const label = siteCopy[language].order.contactUs;
  const href = buildOrderLink(undefined, language);

  if (!href) return null;

  return (
    <a
      className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[#25D366] px-3.5 text-xs font-black text-[#0B3D20] shadow-[0_6px_16px_rgba(37,211,102,0.28)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#C76845]"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <WhatsAppIcon size={17} />
      <span className={compact ? "hidden lg:inline" : undefined}>{label}</span>
    </a>
  );
}
