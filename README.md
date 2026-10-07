# Kayu Pinoes — Situs Katalog Mainan Kayu

Situs katalog mainan kayu (beranda, katalog, halaman produk, tentang, kontak)
dengan pemesanan lewat WhatsApp dan panel admin untuk mengelola produk.
Tampil dalam tiga bahasa: Indonesia, English, dan العربية.

## Teknologi

| Bagian | Teknologi |
|---|---|
| Kerangka aplikasi | Next.js (App Router, TypeScript, Tailwind CSS) |
| Katalog & panel admin | Supabase — PostgreSQL, Auth (email/sandi), Storage (foto) |
| Pemesanan | WhatsApp (tanpa keranjang / pembayaran online) |
| Keamanan data | Row Level Security (RLS) — lihat `supabase/migrations/004_rls.sql` |

Bila Supabase belum dikonfigurasi, situs tetap berjalan memakai katalog bawaan
statis di `src/lib/products.ts` (`isSupabaseConfigured` di `src/lib/supabase.ts`).

## Menjalankan lokal

```bash
npm install
npm run dev        # http://localhost:3000
```

Perintah lain:

```bash
npm run typecheck  # tsc --noEmit
npm run lint
npm test           # node --test (95+ tes)
npm run build
npm run start      # mode produksi
```

Salin `.env.example` menjadi `.env.local` lalu isi nilainya (tabel di bawah),
lalu jalankan ulang server setelah mengubahnya.

## Environment variable

| Nama | Isi |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL — Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key — halaman yang sama |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Email admin (huruf kecil). Untuk gerbang tampilan; hak akses nyata ada di tabel `admin_users` |
| `NEXT_PUBLIC_SITE_URL` | Alamat publik situs untuk sitemap/robots (mis. `https://kayu-pinoes.netlify.app`) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Nomor WhatsApp format internasional tanpa `+`, mis. `62896220222910` |

Semua nilai `NEXT_PUBLIC_*` terkirim ke browser — keamanan dijaga oleh RLS di
database, bukan oleh kerahasiaan kunci anon.

## Database (Supabase)

Skema relasional ada di `supabase/migrations/` — jalankan berurutan di
Supabase → SQL Editor:

| Berkas | Isi |
|---|---|
| `001_initial_schema.sql` | Tabel inti: produk, terjemahan, kategori, rentang usia, material, finishing, varian, harga, foto, admin |
| `002_seed_reference.sql` | Bahasa, mata uang, kategori, rentang usia, material, finishing |
| `003_seed_products.sql` | 8 produk bawaan + seluruh relasinya |
| `004_rls.sql` | RLS + policy semua tabel, fungsi `is_admin()`, RPC `upsert_product` / `delete_product` / `swap_product_order`, trigger admin |
| `005_storage.sql` | Bucket foto `produk` + policy (publik baca; admin tulis) |

`supabase/pasang-awal.sql` adalah gabungan seluruh berkas di atas untuk
pemasangan sekali jalan (aman dijalankan ulang).

### Akun admin

1. Supabase Dashboard → **Authentication → Users → Add user** — daftarkan
   email yang sama dengan `NEXT_PUBLIC_ADMIN_EMAIL` beserta kata sandi.
2. Trigger `bootstrap_admin` (di `004_rls.sql`) otomatis memasukkan email itu
   ke tabel `admin_users` — tabel itulah sumber kebenaran hak admin.
3. Masuk ke `/admin` memakai akun tersebut.

### Foto produk

- Foto bawaan ada di `public/images/products/` dan tetap dipakai (path
  `/images/...` disimpan apa adanya di `product_images.storage_path`).
- Unggahan baru dari panel admin masuk ke Supabase Storage bucket `produk`
  (gambar saja, maksimal 5 MB, lihat `005_storage.sql`).

## Struktur singkat

```
src/app            halaman (App Router) + /admin + /api
src/components     komponen situs & panel admin
src/lib            klien Supabase, pemetaan data, validasi, i18n
supabase/          migration & pemasangan database
tests/             tes node (95+)
```

## Deploy

Target produksi: Netlify (paket gratis). Setelah deploy, isi environment
variable yang sama di dashboard Netlify dan arahkan `NEXT_PUBLIC_SITE_URL` ke
alamat situs yang sebenarnya.
