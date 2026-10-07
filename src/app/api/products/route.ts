import { NextResponse, type NextRequest } from "next/server";

import { getLocalizedProducts, supportedLanguages, type Language } from "@/lib/catalog-i18n";
import { getPublishedProducts } from "@/lib/supabase-products";

/**
 * Route ini membaca parameter `?lang=` sehingga selalu dirender saat permintaan
 * (tidak bisa diprerender statis). Supaya tidak menembak server data pada setiap
 * panggilan, responsnya diberi izin cache di CDN.
 */
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
};

function resolveLanguage(value: string | null): Language {
  if (value && (supportedLanguages as readonly string[]).includes(value)) {
    return value as Language;
  }
  return "id";
}

/**
 * GET /api/products?lang=id|en|ar
 *
 * Mengembalikan katalog produk berstatus "published" dari Supabase bila
 * sudah dikonfigurasi. Bila belum, koleksi masih kosong, atau server data
 * tidak bisa diakses, dipakai katalog statis sebagai fallback supaya endpoint
 * ini tidak pernah gagal total.
 */
export async function GET(request: NextRequest) {
  const language = resolveLanguage(request.nextUrl.searchParams.get("lang"));

  try {
    const supabaseProducts = await getPublishedProducts(language);

    if (supabaseProducts.length > 0) {
      return NextResponse.json(
        { data: supabaseProducts, source: "supabase" },
        { headers: CACHE_HEADERS },
      );
    }
  } catch (error) {
    console.error("Gagal membaca produk dari server data, memakai katalog statis.", error);
  }

  return NextResponse.json(
    { data: getLocalizedProducts(language), source: "static" },
    { headers: CACHE_HEADERS },
  );
}
