export const productIllustrations = [
  "mainan",
  "rainbow",
  "car",
  "blocks",
  "puzzle",
  "hewan",
  "boneka",
  "menara",
  "musik",
  "jam",
] as const;

export type ProductIllustration = (typeof productIllustrations)[number];

/**
 * Satu pilihan varian produk (mis. ukuran) beserta harganya.
 *
 * `price` sengaja berupa teks apa adanya - mis. "$4 / 10 pcs" - dan boleh
 * dikosongkan. Situs tidak pernah menghitung atau mengarang harga sendiri.
 */
export type ProductVariant = {
  /** Nama pilihan, mis. "3 cm". */
  label: string;
  /** Harga apa adanya, mis. "$4 / 10 pcs". Boleh string kosong. */
  price: string;
};

/**
 * Nama yang ditampilkan di panel admin. Ilustrasi ini hanya dipakai sebagai
 * pengganti sementara untuk produk yang belum punya foto - begitu produk
 * punya foto, ilustrasi tidak pernah terlihat pengunjung.
 */
export const productIllustrationLabels: Record<ProductIllustration, string> = {
  mainan: "Mainan (umum)",
  rainbow: "Pelangi",
  car: "Mobil",
  blocks: "Balok",
  puzzle: "Puzzle",
  hewan: "Hewan",
  boneka: "Boneka",
  menara: "Menara susun",
  musik: "Alat musik",
  jam: "Jam",
};

/**
 * Bentuk lengkap sebuah produk setelah digabung dengan terjemahan.
 * Ini yang dipakai oleh halaman publik, katalog, dan halaman detail.
 */
export type Product = {
  id: number;
  /** Alamat ramah mesin pencari, mis. "stacking-rainbow". */
  slug: string;
  name: string;
  category: string;
  age: string;
  description: string;
  wood: string;
  dimensions: string;
  finish: string;
  contents: string;
  care: string;
  surface: string;
  accent: string;
  illustration: ProductIllustration;
  imageUrl?: string;
  /** Varian produk (mis. ukuran) dengan harga opsional; kosong bila tidak ada. */
  variants?: ProductVariant[];
};

/**
 * Data non-teks sebuah produk: alamat, warna, ilustrasi, foto, dan ID.
 *
 * Seluruh TEKS produk hidup di satu tempat saja, yaitu
 * `translations.<bahasa>.products` pada `src/lib/catalog-i18n.ts`.
 */
export type ProductSeed = Pick<
  Product,
  "id" | "slug" | "surface" | "accent" | "illustration" | "imageUrl"
>;

export const productSeeds: ProductSeed[] = [
  {
    id: 1,
    slug: "stacking-rainbow",
    surface: "#F9E2BE",
    accent: "#D88653",
    illustration: "rainbow",
    imageUrl: "/images/products/pelangi-susun.jpeg",
  },
  {
    id: 2,
    slug: "kiko-little-car",
    surface: "#DCE9DD",
    accent: "#6F9275",
    illustration: "car",
    imageUrl: "/images/products/mobil-kecil-kiko.jpeg",
  },
  {
    id: 3,
    slug: "story-blocks",
    surface: "#F6D9CB",
    accent: "#C56E4C",
    illustration: "blocks",
    imageUrl: "/images/products/balok-cerita.jpeg",
  },
  {
    id: 4,
    slug: "morning-garden-puzzle",
    surface: "#DDE7F0",
    accent: "#5E88A1",
    illustration: "puzzle",
    imageUrl: "/images/products/puzzle-kebun-pagi.jpeg",
  },
  {
    id: 5,
    slug: "number-tower",
    surface: "#F3E3C8",
    accent: "#C98A3B",
    illustration: "blocks",
    imageUrl: "/images/products/menara-angka.jpeg",
  },
  {
    id: 6,
    slug: "dodo-pull-duck",
    surface: "#E4EDE2",
    accent: "#6E9A6A",
    illustration: "car",
    imageUrl: "/images/products/bebek-tarik-dodo.jpeg",
  },
  {
    id: 7,
    slug: "melody-xylophone",
    surface: "#F1DDE0",
    accent: "#B76B78",
    illustration: "blocks",
    imageUrl: "/images/products/xilofon-melodi.jpeg",
  },
  {
    id: 8,
    slug: "time-wooden-clock",
    surface: "#E1E8EA",
    accent: "#5E7F8A",
    illustration: "puzzle",
    imageUrl: "/images/products/jam-kayu-waktu.jpeg",
  },
];

/** Foto koleksi untuk kepala halaman katalog dan halaman tentang. */
export const catalogueImage = "/images/products/koleksi.jpeg";

/**
 * Apakah sumber gambar adalah berkas lokal proyek?
 *
 * Path seperti "/images/..." diproses next/image (dapat optimasi ukuran),
 * sedangkan URL luar dari panel admin dirender apa adanya dengan <img> supaya
 * tidak perlu didaftarkan satu per satu di `remotePatterns` - URL yang tidak
 * terdaftar membuat next/image melempar galat, dan itu bisa terjadi kapan saja
 * karena admin bebas menempel URL apa pun.
 *
 * Predikat ini hidup di sini, bukan di komponen, supaya bisa diuji tanpa
 * merender React.
 *
 * Catatan: `//cdn.example.com/a.jpg` (URL protokol-relatif) juga diawali "/"
 * tetapi jelas bukan berkas proyek - tes menemukannya. next/image menolaknya
 * karena host-nya tidak terdaftar, jadi bentuk itu harus masuk jalur <img>.
 */
export function isLocalImageSource(source: string): boolean {
  return source.startsWith("/") && !source.startsWith("//");
}

/**
 * Foto bawaan untuk sebuah produk, dipakai sebagai fallback ketika produk
 * di database belum punya foto sendiri.
 */
export function staticProductImage(productId: number): string | undefined {
  return productSeeds.find((seed) => seed.id === productId)?.imageUrl;
}

/** Alamat bawaan untuk sebuah produk, dipakai untuk tautan dan peta situs. */
export function staticProductSlug(productId: number): string | undefined {
  return productSeeds.find((seed) => seed.id === productId)?.slug;
}

/** Daftar seluruh alamat produk, untuk `generateStaticParams` dan peta situs. */
export function productSlugs(): string[] {
  return productSeeds.map((seed) => seed.slug);
}
