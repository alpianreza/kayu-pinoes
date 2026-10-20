import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { ProductDetailView } from "@/components/site/ProductDetailView";
import { getLocalizedProducts } from "@/lib/catalog-i18n";
import { getPublishedProducts } from "@/lib/supabase-products";
import { DEFAULT_LANGUAGE } from "@/lib/i18n";
import { languageAlternates } from "@/lib/locale-metadata";
import { staticProductSlug, type Product } from "@/lib/products";
import { breadcrumbJsonLd, normalizeBaseUrl, productJsonLd } from "@/lib/seo";
import { isSupabaseConfigured } from "@/lib/supabase";

// Semua halaman detail dirender saat diminta (bukan sekali saat build), supaya
// perubahan CMS - produk baru, produk yang dihapus, atau teks yang diperbaiki -
// langsung berlaku tanpa build ulang. Produk yang tidak ada di CMS akan 404.
export const dynamic = "force-dynamic";

/**
 * Cari produk berdasarkan alamat dari server data (CMS).
 *
 * Server data diutamakan; katalog bawaan hanya dipakai bila server data tidak
 * dikonfigurasi atau tidak bisa dihubungi. Dengan urutan ini, produk yang
 * dihapus atau disembunyikan lewat panel admin langsung tidak bisa dibuka.
 * Aturan RLS hanya membuka produk berstatus published untuk pengunjung, jadi
 * aman dipanggil tanpa login.
 */
async function findProduct(slug: string): Promise<Product | null> {
  if (isSupabaseConfigured) {
    try {
      const serverProducts = await getPublishedProducts(DEFAULT_LANGUAGE);
      return serverProducts.find((item) => item.slug === slug) ?? null;
    } catch {
      // Server data tidak bisa dihubungi: jatuh ke katalog bawaan di bawah.
    }
  }

  return getLocalizedProducts(DEFAULT_LANGUAGE).find((item) => item.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await findProduct(slug);

  if (!product) {
    return { title: "Produk tidak ditemukan" };
  }

  const title = `${product.name}: Mainan Kayu Edukatif`;
  // Deskripsi produk dari CMS dipakai apa adanya; kalimat cadangan hanya untuk
  // produk yang belum punya deskripsi.
  const description =
    product.description?.trim() ||
    `${product.name}: mainan kayu edukatif dari kayu pinus buatan Kayu Pinoes. Lihat bahan, ukuran, dan cara pesan.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/products/${product.slug}`,
      // Satu alamat melayani tiga bahasa; pilihan bahasa disimpan di browser
      // dan bisa dipaksa lewat `?lang=`, jadi hreflang menunjuk ke alamat itu.
      languages: languageAlternates(`/products/${product.slug}`),
    },
    openGraph: {
      title: `${title} — Kayu Pinoes`,
      description,
      type: "website",
      ...(product.imageUrl
        ? { images: [{ url: product.imageUrl, alt: product.name }] }
        : {}),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Alamat lama berbasis angka diarahkan permanen ke alamat ramah mesin pencari,
  // supaya tidak ada dua alamat untuk isi yang sama.
  if (/^\d+$/.test(slug)) {
    const niceSlug = staticProductSlug(Number(slug));
    if (niceSlug) permanentRedirect(`/products/${niceSlug}`);
  }

  // Produk dicari sekali di server: hasilnya dipakai untuk penjagaan 404
  // sekaligus dikirim ke halaman sebagai isi awal, sehingga produk dari CMS
  // langsung tampil utuh (tanpa kedipan "tidak ditemukan") dan isinya ikut
  // ter-render di server.
  const product = await findProduct(slug);
  if (!/^\d+$/.test(slug) && !product) notFound();

  // Data terstruktur (schema.org) untuk mesin pencari: produk + remah roti.
  const base = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const structuredData =
    product && base
      ? [
          productJsonLd(product, base),
          breadcrumbJsonLd([
            { name: "Home", url: `${base}/` },
            { name: "Catalog", url: `${base}/products` },
            { name: product.name, url: `${base}/products/${product.slug}` },
          ]),
        ]
      : [];

  return (
    <>
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      <ProductDetailView slug={slug} initialProduct={product} />
    </>
  );
}