import type { MetadataRoute } from "next";

function siteUrl(): string | null {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (!raw) return null;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Panel admin tidak untuk publik, dan endpoint API tidak perlu diindeks.
        // Diberi garis miring di belakang agar seluruh isi di dalamnya tertutup
        // (bentuk "/admin" saja hanya cocok persis dengan satu alamat itu).
        disallow: ["/admin/", "/api/"],
      },
    ],
    // Sitemap hanya didaftarkan bila alamat situs sudah diketahui dari
    // NEXT_PUBLIC_SITE_URL. Tidak ada alamat yang dikarang di sini.
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}
