"use client";

import { useLanguage } from "@/components/site/LanguageProvider";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { siteCopy } from "@/lib/site-copy";
import { buildOrderLink } from "@/lib/whatsapp";

/**
 * Tombol "Pesan" yang membuka WhatsApp dengan pesan sudah terisi.
 *
 * Tidak dirender bila nomor WhatsApp belum dikonfigurasi - sengaja tanpa pesan
 * penjelasan, supaya halaman tidak menampilkan teks yang tidak perlu.
 */
export function OrderButton({
  productName,
  className,
  label,
}: {
  productName?: string;
  className?: string;
  label?: string;
}) {
  const { language } = useLanguage();
  const copy = siteCopy[language].order;
  const href = buildOrderLink(productName, language);

  if (!href) return null;

  return (
    <Button asChild size="lg" className={className}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon size={18} /> {label ?? copy.button}
      </a>
    </Button>
  );
}
