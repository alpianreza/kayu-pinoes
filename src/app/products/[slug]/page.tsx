import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { ProductDetailView } from "@/components/site/ProductDetailView";
import { getLocalizedProducts } from "@/lib/catalog-i18n";
import { getPublishedFirebaseProducts } from "@/lib/firebase-products";
import { DEFAULT_LANGUAGE } from "@/lib/i18n";
import { languageAlternates } from "@/lib/locale-metadata";
import { productSeeds, productSlugs, staticProductSlug, type Product } from "@/lib/products";

/**
 * Kedelapan alamat bawaan dirender sekali saat build. Alamat lain tetap
 * dilayani: produk yang dibuat lewat panel admin boleh punya alamat baru, dan
 * itu tidak mungkin diketahui saat build. Halaman seperti itu dirender saat
 * diminta, lalu disimpan sesuai `revalidate`.
 */
export function generateStaticParams() {
  return productSlugs().map((slug) => ({ slug }));
}

export const revalidate = 300;

/**
 * Cari produk berdasarkan alamat, dari katalog bawaan lalu dari Firestore.
 *
 * Sebelumnya halaman ini hanya mengenali alamat katalog bawaan dan menolak
 * sisanya dengan 404 - akibatnya produk yang dibuat admin tidak pernah bisa
 * dibuka, walaupun kartunya tampil di katalog. Dokumen Firestore hanya berisi
 * produk berstatus published, dan query-nya sudah difilter seperti yang
 * dituntut security rules, jadi aman dipanggil tanpa login.
 */
async function findProduct(slug: string): Promise<Product | null> {
  const staticProduct = getLocalizedProducts(DEFAULT_LANGUAGE).find((item) => item.slug === slug);
  if (staticProduct) return staticProduct;

  try {
    const firestoreProducts = await getPublishedFirebaseProducts(DEFAULT_LANGUAGE);
    return firestoreProducts.find((item) => item.slug === slug) ?? null;
  } catch {
    // Firestore tidak bisa dihubungi: alamat tak dikenal dianggap tidak ada,
    // dan halaman bawaan tetap dilayani seperti biasa.
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await findProduct(slug);

  if (!product) {
    return { title: "Product — Kayu Pinoes" };
  }

  const title = `${product.name} — Kayu Pinoes`;

  return {
    title,
    description: product.description,
    alternates: {
      canonical: `/products/${product.slug}`,
      // Satu alamat melayani tiga bahasa; pilihan bahasa disimpan di browser
      // dan bisa dipaksa lewat `?lang=`, jadi hreflang menunjuk ke alamat itu.
      languages: languageAlternates(`/products/${product.slug}`),
    },
    openGraph: {
      title,
      description: product.description,
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

  // Angka yang tidak ada di katalog bawaan tetap diteruskan: dokumen Firestore
  // memakai string angka sebagai nama dokumen, dan itu diselesaikan di sisi klien.
  if (!/^\d+$/.test(slug)) {
    const known = productSeeds.some((seed) => seed.slug === slug) || (await findProduct(slug));
    if (!known) notFound();
  }

  return <ProductDetailView slug={slug} />;
}