import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Foto produk diunggah ke Firebase Storage, sehingga next/image perlu izin
    // untuk domain tersebut. Daftarnya sengaja dipersempit ke bucket milik
    // project ini saja, bukan wildcard ke semua bucket Firebase.
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "kayu-pinoes.firebasestorage.app" },
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
