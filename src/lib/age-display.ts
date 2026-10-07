import type { Language } from "./catalog-i18n.ts";

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Ubah angka Latin (0-9) menjadi angka Arab-Indic (٠-٩). */
export function toArabicDigits(text: string): string {
  return text.replace(/[0-9]/g, (digit) => ARABIC_DIGITS[Number(digit)]);
}

/**
 * Bentuk teks rentang usia yang dilihat pengunjung dari data bulan.
 *
 * Contoh: (12, 48) -> "1–4 tahun" | "1–4 years" | "١–٤ سنوات".
 * Selalu memakai tanda pisah "–" (en dash) - sama seperti data lama, dan
 * angka Arab memakai digit Arab-Indic supaya terbaca wajar.
 */
export function formatAgeRange(minMonths: number, maxMonths: number, language: Language): string {
  const low = Math.min(minMonths, maxMonths);
  const high = Math.max(minMonths, maxMonths);

  const wholeYears = low >= 12 && low % 12 === 0 && high % 12 === 0;

  if (wholeYears) {
    const first = low / 12;
    const last = high / 12;
    const range = first === last ? `${first}` : `${first}–${last}`;

    if (language === "ar") return `${toArabicDigits(range)} سنوات`;
    if (language === "en") return `${range} years`;
    return `${range} tahun`;
  }

  const range = low === high ? `${low}` : `${low}–${high}`;

  if (language === "ar") return `${toArabicDigits(range)} أشهر`;
  if (language === "en") return `${range} months`;
  return `${range} bulan`;
}
