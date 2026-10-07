This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Firebase

Proyek ini memakai Firebase untuk tiga hal:

| Bagian | Layanan | Kode |
|---|---|---|
| Katalog produk (baca) | Cloud Firestore, koleksi `products` | `src/lib/firebase-products.ts` |
| Kelola produk (tulis + unggah foto) | Firestore + Cloud Storage | `src/lib/firebase-product-admin.ts`, `src/app/admin/page.tsx` |
| Login admin | Firebase Authentication (Email/Password) | `src/app/admin/page.tsx` |

Selama kredensial belum diisi, situs tetap berjalan normal memakai katalog statis di
`src/lib/products.ts` — Firebase akan diabaikan sepenuhnya (lihat `isFirebaseConfigured`
di `src/lib/firebase.ts`).

### 1. Environment variable

Salin `.env.example` menjadi `.env.local`, lalu isi:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_ADMIN_EMAIL=
```

Enam nilai pertama diambil dari Firebase Console → Project settings → General →
Your apps → Web app (`</>`) → SDK setup and configuration → Config.
Karena semua diawali `NEXT_PUBLIC_`, nilai ini memang terkirim ke browser — perlakukan
security rules sebagai satu-satunya penjaga data, bukan kerahasiaan config.

Jalankan ulang `npm run dev` / build setelah mengubah `.env.local`.

### 2. Admin

1. `firestore.rules` dan `storage.rules` sudah memuat email admin proyek ini secara
   literal (`alpianrezha@gmail.com`). Security Rules tidak bisa membaca environment
   variable, jadi bila email admin berganti, nilai literal di KEDUA berkas rules itu
   wajib diubah agar tetap sama persis dengan `NEXT_PUBLIC_ADMIN_EMAIL`
   (huruf kecil semua — perbandingannya case-sensitive).
2. Di Firebase Console → Authentication → Sign-in method, aktifkan **Email/Password**.
3. Buat akun admin di Firebase Console → Authentication → Users.
4. Buka `/admin`, masuk dengan akun tersebut.

> Catatan penting: `firestore.rules` dan `storage.rules` di repo ini adalah sumber
> kebenaran. Rules yang terpasang di Firebase Console bisa saja masih versi lama —
> deploy ulang sesudah setiap perubahan (bagian 3).

### 3. Deploy rules & hosting

```bash
# ganti placeholder project id lebih dulu (.firebaserc), atau:
npx firebase-tools use --add

npx firebase-tools deploy --only firestore:rules,storage
```

`firebase.json` juga menyiapkan blok `hosting` (`source: "."`,
`frameworksBackend.region: asia-southeast2`) untuk Next.js. Untuk memakainya,
aktifkan dukungan Web Frameworks lebih dulu:

```bash
npx firebase-tools experiments:enable webframeworks
npx firebase-tools deploy --only hosting
```

### 4. Skema koleksi `products`

Document ID = string dari `id` (mis. `"1"`).

```jsonc
{
  "id": 1,                       // number, juga dipakai sebagai document ID
  "slug": "stacking-rainbow",    // opsional, alamat /products/{slug}; huruf kecil + tanda hubung
  "surface": "#F9E2BE",          // warna latar kartu
  "accent": "#D88653",           // warna aksen
  "illustration": "rainbow",     // mainan | rainbow | car | blocks | puzzle | hewan | boneka | menara | musik | jam
  "status": "published",         // draft | published
  "order": 1,                    // urutan tampil (kecil = lebih dahulu)
  "imageUrl": "https://...",     // opsional, hasil unggahan Storage
  "imagePath": "products/1-...", // opsional, path di Storage
  "translations": {
    "id": { "name": "...", "category": "...", "age": "...", "description": "...",
            "wood": "...", "dimensions": "...", "finish": "...", "contents": "...", "care": "..." },
    "en": { /* ... */ },
    "ar": { /* ... */ }
  }
}
```

Hanya dokumen berstatus `published` yang tampil di halaman publik.
`firestore.rules` menolak penulisan dengan field di luar daftar di atas, dan
menuntut ketiga bahasa lengkap sembilan kunci — jadi dokumen yang dibuat manual
di Console bisa ditolak saat disimpan ulang lewat `/admin` kalau isinya kurang.

Produk yang alamatnya tidak ada di katalog bawaan (mis. buatan admin) dilayani
secara dinamis: halamannya dirender saat diminta lalu di-cache 5 menit, jadi
alamatnya langsung bisa dibuka tanpa build ulang.

### 5. Endpoint API

`GET /api/products` mengembalikan produk `published` dari Firestore, dengan
fallback ke katalog statis. Respons: `{ "data": [...], "source": "firestore" | "static" }`.

### 6. Foto produk tanpa Firebase Storage

Cloud Storage tidak termasuk paket gratis, jadi upload langsung ke Storage
memerlukan plan Blaze. Kalau belum mau upgrade, foto produk tetap bisa dipakai
tanpa biaya sama sekali:

1. Taruh berkas gambar di folder `public/images/` pada proyek ini.
2. Di panel `/admin`, isi kolom **URL atau path foto** dengan path lokalnya,
   misalnya `/images/mobil-kiko.png` (awali dengan garis miring).

Nilai itu juga boleh berupa URL lengkap dari layanan lain, misalnya
`https://situs-anda.com/foto.png`. Path lokal diproses `next/image`; URL luar
ditampilkan apa adanya sehingga tidak perlu menambah `remotePatterns`.

Tombol upload ke Storage tetap ada dan akan berfungsi begitu project memakai
plan Blaze.
