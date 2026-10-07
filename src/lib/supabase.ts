import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Klien Supabase untuk seluruh situs.
 *
 * Satu klien untuk peramban & server: kunci `anon` memang untuk konsumsi
 * publik - keamanan sesungguhnya dijaga RLS di database. Sesi login hanya
 * hidup di peramban admin; di server klien tidak menyimpan sesi.
 */

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const SUPABASE_URL = supabaseUrl;

/** Nama bucket foto produk di Supabase Storage. */
export const PRODUCT_IMAGE_BUCKET = "produk";

let cachedClient: SupabaseClient | null = null;

export function supabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== "undefined",
        autoRefreshToken: typeof window !== "undefined",
        detectSessionInUrl: false,
      },
    });
  }

  return cachedClient;
}

/**
 * Alamat yang bisa dibuka siapa saja untuk sebuah foto produk.
 *
 * Path "/images/..." (berkas bawaan situs) dan URL penuh dibiarkan apa
 * adanya; nama objek di bucket "produk" dibentuk menjadi alamat publik
 * Supabase supaya foto hasil unggahan langsung tampil.
 */
export function productImageUrl(storagePath: string, baseUrl: string = supabaseUrl): string {
  if (/^(\/|https?:\/\/)/i.test(storagePath)) return storagePath;
  return `${baseUrl}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${storagePath}`;
}
