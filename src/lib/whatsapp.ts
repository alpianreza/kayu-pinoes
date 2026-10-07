import type { Language } from "./catalog-i18n.ts";

const RAW_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").trim();

/**
 * Nomor WhatsApp untuk pesanan dan pertanyaan, dari NEXT_PUBLIC_WHATSAPP_NUMBER.
 *
 * Bernilai null bila belum diisi atau formatnya tidak wajar. Kode tidak pernah
 * memakai nomor cadangan yang dikarang.
 */
export const whatsappNumber: string | null = /^\d{8,15}$/.test(RAW_NUMBER) ? RAW_NUMBER : null;

export function isWhatsappConfigured(): boolean {
  return whatsappNumber !== null;
}

const MESSAGES: Record<
  Language,
  {
    general: string;
    product: (name: string) => string;
    variant: (name: string, variant: string) => string;
  }
> = {
  id: {
    general: "Halo Kayu Pinoes, saya mau bertanya tentang koleksi mainan kayunya.",
    product: (name) => `Halo Kayu Pinoes, saya mau bertanya tentang produk "${name}".`,
    variant: (name, variant) =>
      `Halo Kayu Pinoes, saya mau bertanya tentang produk "${name}" (${variant}).`,
  },
  en: {
    general: "Hello Kayu Pinoes, I would like to ask about your wooden toy collection.",
    product: (name) => `Hello Kayu Pinoes, I would like to ask about the product "${name}".`,
    variant: (name, variant) =>
      `Hello Kayu Pinoes, I would like to ask about the product "${name}" (${variant}).`,
  },
  ar: {
    general: "مرحباً كايو بينويس، أود الاستفسار عن مجموعة الألعاب الخشبية.",
    product: (name) => `مرحباً كايو بينويس، أود الاستفسار عن المنتج "${name}".`,
    variant: (name, variant) =>
      `مرحباً كايو بينويس، أود الاستفسار عن المنتج "${name}" (${variant}).`,
  },
};

export function buildOrderMessage(
  productName?: string,
  language: Language = "en",
  variantLabel?: string,
): string {
  const copy = MESSAGES[language] ?? MESSAGES.en;
  if (productName && variantLabel) return copy.variant(productName, variantLabel);
  return productName ? copy.product(productName) : copy.general;
}

/** Tautan wa.me siap pakai, atau null bila nomor belum dikonfigurasi. */
export function buildOrderLink(
  productName?: string,
  language: Language = "en",
  variantLabel?: string,
): string | null {
  if (!whatsappNumber) return null;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    buildOrderMessage(productName, language, variantLabel),
  )}`;
}

/** Tampilan nomor yang enak dibaca, mis. +62 896 2202 22910. */
export function formatWhatsappNumber(): string | null {
  if (!whatsappNumber) return null;
  return `+${whatsappNumber.slice(0, 2)} ${whatsappNumber.slice(2)}`;
}
