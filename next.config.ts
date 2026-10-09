import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Foto hasil unggahan panel admin disimpan di Supabase Storage; izin
    // domain tetap dipersempit ke project ini saja. Foto bawaan "/images/..."
    // tidak butuh entri di sini.
    remotePatterns: [
      { protocol: "https", hostname: "aoawbhhnpndntqziefjv.supabase.co" },
    ],
  },
  async redirects() {
    // Rute lama berbahasa Indonesia diarahkan ke rute Inggris yang baru,
    // supaya tautan yang sudah beredar tidak mati.
    return [
      { source: "/produk", destination: "/products", permanent: true },
      { source: "/produk/:id", destination: "/products/:id", permanent: true },
      { source: "/tentang", destination: "/about", permanent: true },
      { source: "/kontak", destination: "/contact", permanent: true },
    ];
  },
};

export default nextConfig;
