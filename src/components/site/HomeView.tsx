"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowRight,
  Blocks,
  CarFront,
  ChevronRight,
  Heart,
  Leaf,
  Sparkles,
  TreePine,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { useLanguage } from "@/components/site/LanguageProvider";
import { ProductImage } from "@/components/site/ProductImage";
import { ProductVariants } from "@/components/site/ProductVariants";
import { ProductSlideshow } from "@/components/site/ProductSlideshow";
import { ToyArtwork } from "@/components/site/ToyArtwork";
import { getLocalizedProducts, translations } from "@/lib/catalog-i18n";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  getLocalizedProduct,
  subscribeToPublishedProducts,
  type ManagedProduct,
} from "@/lib/firebase-products";
import type { Product } from "@/lib/products";

const categoryStyles = [
  {
    icon: Blocks,
    color: "bg-[#F8D8BF]",
    iconColor: "text-[#B96040]",
  },
  {
    icon: CarFront,
    color: "bg-[#DCE9DD]",
    iconColor: "text-[#456C4D]",
  },
  {
    icon: Sparkles,
    color: "bg-[#DCE8F1]",
    iconColor: "text-[#547A91]",
  },
];

function ProductVisual({ product, sizes }: { product: Product; sizes: string }) {
  if (product.imageUrl) {
    return (
      <ProductImage
        src={product.imageUrl}
        alt=""
        sizes={sizes}
        className="object-cover object-center"
      />
    );
  }

  return <ToyArtwork illustration={product.illustration} />;
}

const FAVORITES_STORAGE_KEY = "kayu-pinoes:favorites";

/**
 * Durasi animasi keluar dialog spesifikasi. Pembongkaran isi ditunda sedikit
 * lebih lama daripada animasinya supaya tidak terpotong.
 */
const CLOSE_ANIMATION_MS = 170;

/**
 * Isi halaman beranda.
 *
 * Dipisah dari `app/page.tsx` supaya berkas rute-nya bisa tetap berupa server
 * component dan mengekspor metadata - berkas dengan "use client" tidak boleh
 * mengekspor `metadata`.
 */
export function HomeView() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const dialogRef = useRef<HTMLElement | null>(null);
  const dialogTitleRef = useRef<HTMLHeadingElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const { language } = useLanguage();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const [managedProducts, setManagedProducts] = useState<ManagedProduct[] | null>(null);
  const copy = translations[language];
  const fallbackProducts = useMemo(() => getLocalizedProducts(language), [language]);
  const catalogProducts = useMemo(
    () =>
      (managedProducts ?? [])
        .filter((product) => product.status === "published")
        .map((product) => getLocalizedProduct(product, language)),
    [language, managedProducts],
  );
  const products = catalogProducts.length > 0 ? catalogProducts : fallbackProducts;
  const slideImages = useMemo(
    () =>
      products
        .filter((product) => Boolean(product.imageUrl))
        .map((product) => ({ src: product.imageUrl as string, alt: product.name })),
    [products],
  );
  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null;
  const isRtl = copy.direction === "rtl";
  const heroTextAlignment = isRtl ? "items-end text-right" : "items-start";
  const arrowClass = isRtl ? "rotate-180" : undefined;
  const movingArrowClass = `transition-transform ${isRtl ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`;
  const heroNotePosition = isRtl ? "right-6 sm:right-8" : "left-6 sm:left-8";
  const heroBadgePosition = isRtl ? "left-6 sm:left-8" : "right-6 sm:right-8";
  const cardStartPosition = isRtl ? "right-4" : "left-4";
  const cardEndPosition = isRtl ? "left-3" : "right-3";
  const dialogStartPosition = isRtl ? "right-5" : "left-5";
  const dialogEndPosition = isRtl ? "left-4" : "right-4";
  const detailCellClasses = isRtl ? "odd:pl-4 even:border-r even:pr-4" : "odd:pr-4 even:border-l even:pl-4";

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    // Katalog dari Firestore. Bila Firebase belum dikonfigurasi, koleksi masih
    // kosong, atau terjadi error, halaman tetap memakai produk bawaan.
    const unsubscribe = subscribeToPublishedProducts(
      (nextProducts) => setManagedProducts(nextProducts),
      (error) => {
        console.warn("Katalog Firestore tidak dapat dibaca, memakai produk bawaan.", error);
        setManagedProducts([]);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    // localStorage hanya ada di browser. Membacanya setelah mount menghindari
    // perbedaan antara HTML yang dirender server dan render pertama di klien.
    try {
      const stored = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- penyimpanan browser hanya bisa dibaca setelah mount
          setFavorites(parsed.filter((value): value is number => typeof value === "number"));
        }
      }
    } catch {
      // localStorage bisa diblokir (mis. mode privat); favorit sekadar tidak tersimpan.
    }

    setFavoritesLoaded(true);
  }, []);

  useEffect(() => {
    if (!favoritesLoaded) return;

    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Abaikan kegagalan penyimpanan; favorit tetap bekerja di sesi ini.
    }
  }, [favorites, favoritesLoaded]);

  useEffect(() => {
    if (selectedProductId === null) return;
    // Fokus awal ke judul agar pembaca layar mengumumkan nama produk.
    dialogTitleRef.current?.focus();
  }, [selectedProductId]);

  // Bila halaman ditinggalkan saat animasi keluar berjalan, jangan biarkan
  // timer menukar status komponen yang sudah lepas.
  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    },
    [],
  );

  function toggleFavorite(productId: number) {
    setFavorites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  /**
   * Membuka dialog. Bila penutupan sebelumnya masih beranimasi, timer-nya
   * dibatalkan supaya dialog tidak langsung hilang lagi setelah dibuka.
   */
  function openDetail(productId: number, trigger: HTMLButtonElement) {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setClosing(false);
    triggerRef.current = trigger;
    setSelectedProductId(productId);
  }

  /**
   * Menutup dialog dengan animasi keluar: penanda `closing` dipasang lebih
   * dulu, isinya baru dibongkar setelah animasinya selesai. Fokus dikembalikan
   * ke tombol pemicu seketika, tanpa menunggu pembongkaran.
   */
  function closeDetail() {
    if (selectedProductId === null || closing) return;

    triggerRef.current?.focus();
    setClosing(true);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    closeTimerRef.current = window.setTimeout(
      () => {
        closeTimerRef.current = null;
        setSelectedProductId(null);
        setClosing(false);
      },
      reduced ? 0 : CLOSE_ANIMATION_MS,
    );
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      closeDetail();
      return;
    }

    if (event.key !== "Tab") return;

    const container = dialogRef.current;
    if (!container) return;

    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      ),
    );

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    // Jaga fokus tetap di dalam dialog selama dialog terbuka.
    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && (active === first || active === container)) {
      event.preventDefault();
      last.focus();
    }
  }

  const categories = categoryStyles.map((style, index) => ({
    ...style,
    ...copy.collection.categories[index]!,
  }));

  return (
    <div
      lang={language}
      dir={copy.direction}
      className="min-h-dvh overflow-x-hidden bg-[#FBF9F3] text-[#27372D]"
      onKeyDownCapture={(event) => {
        if (selectedProduct && event.key === "Escape") closeDetail();
      }}
    >
      <SiteHeader active="/" />

      <main id="content">
        <section className="mx-auto max-w-7xl px-5 pb-14 pt-7 sm:px-8 sm:pt-10 lg:px-10 lg:pb-20">
          <div className="relative grid overflow-hidden rounded-[2.2rem] bg-[#E8EBDD] lg:grid-cols-[1.03fr_.97fr]">
            <div className={`relative z-10 flex flex-col px-7 py-11 sm:px-12 sm:py-16 lg:px-16 lg:py-20 ${heroTextAlignment}`}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#314B3A]/10 bg-[#FBF9F3]/80 px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#49604E]">
                <Sparkles size={14} />
                {copy.hero.eyebrow}
              </div>
              <h1 className="font-display max-w-xl text-5xl font-medium leading-[0.94] tracking-[-0.065em] text-[#294332] sm:text-6xl lg:text-7xl">
                {copy.hero.title[0]}
                <span className="block text-[#C76845]">{copy.hero.title[1]}</span>
              </h1>
              <p className="mt-6 max-w-md text-[1.02rem] leading-7 text-[#536459] sm:text-lg">
                {copy.hero.description}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/products">{copy.hero.browseCollection} <ArrowRight className={arrowClass} size={18} /></Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/about">{copy.hero.meetBrand}</Link>
                </Button>
              </div>
              <div className="mt-12 flex flex-wrap gap-x-7 gap-y-4 text-sm text-[#526259]">
                <span className="flex items-center gap-2"><Leaf size={17} className="text-[#527A58]" /> {copy.hero.selectedWood}</span>
                <span className="flex items-center gap-2"><TreePine size={17} className="text-[#527A58]" /> {copy.hero.madeWithCare}</span>
              </div>
            </div>

            <div className="relative min-h-[390px] overflow-hidden sm:min-h-[470px] lg:min-h-full">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_22%,rgba(247,216,191,.9),transparent_25%),radial-gradient(circle_at_13%_93%,rgba(214,232,241,.8),transparent_25%)]" />
              <Image
                src="/images/pinoes-hero-toys.png"
                alt={copy.hero.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center mix-blend-multiply"
              />
              <div className={`absolute bottom-6 max-w-[185px] rounded-2xl border border-white/65 bg-[#FBF9F3]/90 p-3.5 shadow-[0_14px_40px_rgba(54,65,52,0.12)] backdrop-blur-sm sm:bottom-8 ${heroNotePosition}`}>
                <span className="mb-2 grid size-8 place-items-center rounded-full bg-[#DDE9DD] text-[#456C4D]"><Leaf size={16} /></span>
                <p className="text-xs font-bold leading-5 text-[#3F5044]">{copy.hero.waterBasedPaint}</p>
              </div>
              <div className={`absolute top-6 flex size-17 rotate-6 flex-col items-center justify-center rounded-full border border-[#314B3A]/10 bg-[#F9E2BE]/90 text-center font-display text-lg leading-none text-[#775838] shadow-sm sm:top-8 ${heroBadgePosition}`}>
                100%<span className="mt-1 font-sans text-[8px] font-black uppercase tracking-[0.13em]">{copy.hero.playBadge}</span>
              </div>
            </div>
          </div>
        </section>

        <section id="koleksi" className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:mb-10 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#C76845]">{copy.collection.eyebrow}</p>
              <h2 className="font-display text-4xl tracking-[-0.055em] text-[#294332] sm:text-5xl">{copy.collection.title}</h2>
            </div>
            <Link href="/products" className="group inline-flex items-center gap-2 text-sm font-extrabold text-[#314B3A] hover:text-[#C76845]">
              {copy.collection.allCollections} <ArrowRight className={movingArrowClass} size={17} />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.name} href="/products" className={`${category.color} group rounded-[1.7rem] p-6 transition-transform duration-200 hover:-translate-y-1`}>
                  <div className={`mb-12 grid size-12 place-items-center rounded-2xl bg-white/55 ${category.iconColor}`}><Icon size={24} strokeWidth={1.7} /></div>
                  <h3 className="font-display text-2xl tracking-[-0.04em] text-[#334139]">{category.name}</h3>
                  <div className="mt-2 flex items-center justify-between gap-4 text-sm font-medium text-[#536459]">
                    <span>{category.description}</span><ChevronRight className={movingArrowClass} size={18} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section id="produk" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#C76845]">{copy.gallery.eyebrow}</p>
              <h2 className="font-display text-4xl tracking-[-0.055em] text-[#294332] sm:text-5xl">{copy.gallery.title}</h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-[#647168]">{copy.gallery.description}</p>
          </div>

          <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const liked = favorites.includes(product.id);
              return (
                <article key={product.id} className="group min-w-0 transition-transform duration-200 ease-out hover:-translate-y-1">
                  <div className="relative aspect-[1/1.08] overflow-hidden rounded-[1.7rem]" style={{ backgroundColor: product.surface }}>
                    <span className={`absolute top-4 z-10 rounded-full bg-[#FBF9F3]/85 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#526259] ${cardStartPosition}`}>{product.age}</span>
                    <button
                      className={`absolute top-3 z-10 grid size-10 place-items-center rounded-full bg-[#FBF9F3]/85 transition-colors hover:bg-white ${cardEndPosition} ${liked ? "text-[#C76845]" : "text-[#55645A]"}`}
                      aria-label={liked ? copy.gallery.removeFavorite(product.name) : copy.gallery.addFavorite(product.name)}
                      type="button"
                      onClick={() => toggleFavorite(product.id)}
                    >
                      <Heart size={18} fill={liked ? "currentColor" : "none"} />
                    </button>
                    <span className="absolute inset-0 block transition-transform duration-500 ease-out group-hover:scale-[1.05]"><ProductVisual product={product} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" /></span>
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/[0.05] to-transparent" />
                  </div>
                  <div className="px-1 pt-4">
                    <p className="text-xs font-bold text-[#748077]">{product.category}</p>
                    <h3 className="mt-1 font-display text-xl tracking-[-0.04em] text-[#334139]">{product.name}</h3>
                    <Button
                      className="mt-4 w-full"
                      variant="outline"
                      size="sm"
                      aria-haspopup="dialog"
                      onClick={(event) => openDetail(product.id, event.currentTarget)}
                    >
                      {copy.gallery.viewSpecifications} <ArrowRight className={arrowClass} size={15} />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="cerita" className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="grid overflow-hidden rounded-[2.2rem] bg-[#314B3A] text-[#F9F4E8] lg:grid-cols-[.85fr_1.15fr]">
            <div className={`flex flex-col px-7 py-12 sm:px-12 sm:py-15 ${heroTextAlignment}`}>
              <div className="grid size-12 place-items-center rounded-2xl bg-[#F4C45D] text-[#314B3A]"><TreePine size={24} /></div>
              <p className="mt-9 text-xs font-extrabold uppercase tracking-[0.15em] text-[#F4C45D]">{copy.story.eyebrow}</p>
              <h2 className="font-display mt-3 text-4xl leading-[.98] tracking-[-0.055em] sm:text-5xl">{copy.story.title}</h2>
              <p className="mt-6 max-w-sm leading-7 text-[#D9E1D5]">{copy.story.description}</p>
              <Button asChild className="mt-8 bg-[#F9F4E8] text-[#314B3A] shadow-none hover:bg-white">
                <Link href="/about">{copy.story.howWeMakeIt} <ArrowRight className={arrowClass} size={17} /></Link>
              </Button>
            </div>
            <div className="relative min-h-[320px] bg-[#E0AA75] p-7 sm:min-h-[370px] sm:p-10">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.18),transparent_38%),repeating-linear-gradient(92deg,rgba(98,60,30,.06)_0,rgba(98,60,30,.06)_1px,transparent_1px,transparent_24px)]" />
              <div className="relative h-full">
                <div className="relative h-full min-h-[264px] overflow-hidden rounded-[1.6rem] border border-white/25 bg-[#F9F4E8] sm:min-h-[290px]">
                  <ProductSlideshow images={slideImages} label={copy.story.graphicLabel} />
                </div>
                <span className={`absolute bottom-4 -rotate-3 rounded-xl bg-[#DDE9DD] px-4 py-3 text-sm font-extrabold text-[#365440] shadow-sm ${isRtl ? "left-4" : "right-4"}`}>{copy.story.graphicLabel}</span>
              </div>
            </div>
          </div>
        </section>

        <section id="nilai" className="mx-auto max-w-7xl px-5 pb-18 pt-12 sm:px-8 lg:px-10 lg:pb-24">
          <div className="grid gap-6 border-y border-[#314B3A]/10 py-10 sm:grid-cols-3">
            {copy.values.map((value, index) => (
              <div key={value.title} className="flex gap-4 sm:pr-6">
                <span className="font-display text-3xl text-[#D98B64]">0{index + 1}</span>
                <div><h3 className="font-display text-xl tracking-[-0.035em]">{value.title}</h3><p className="mt-2 text-sm leading-6 text-[#68766D]">{value.copy}</p></div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {selectedProduct && (
        <div
          className={`kp-modal-backdrop fixed inset-0 z-50 grid place-items-end bg-[#1F3025]/45 p-3 backdrop-blur-sm sm:place-items-center sm:p-6${closing ? " kp-modal-closing" : ""}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDetail();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-detail-title"
            ref={dialogRef}
            tabIndex={-1}
            onKeyDown={handleDialogKeyDown}
            className={`kp-modal-panel relative grid max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-[#FBF9F3] shadow-[0_24px_70px_rgba(31,48,37,0.25)] sm:grid-cols-[.85fr_1.15fr]${closing ? " kp-modal-closing" : ""}`}
          >
            <div className="relative min-h-64 overflow-hidden bg-[#E8EBDD] sm:min-h-full" style={{ backgroundColor: selectedProduct.surface }}>
              <ProductVisual product={selectedProduct} sizes="(max-width: 640px) 100vw, 40vw" />
              <span className={`absolute bottom-5 rounded-full bg-[#FBF9F3]/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#526259] ${dialogStartPosition}`}>
                {selectedProduct.category}
              </span>
            </div>

            <div className="p-6 sm:p-8">
              <button
                className={`absolute top-4 grid size-11 place-items-center rounded-full bg-[#FBF9F3]/90 text-[#435349] transition-colors hover:bg-white focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#C76845] ${dialogEndPosition}`}
                type="button"
                aria-label={copy.detail.closeDetail(selectedProduct.name)}
                onClick={closeDetail}
              >
                <X size={20} />
              </button>
              <p className="pr-12 text-xs font-extrabold uppercase tracking-[0.14em] text-[#C76845]">{copy.detail.collectionLabel}</p>
              <h2 id="product-detail-title" ref={dialogTitleRef} tabIndex={-1} className="mt-3 font-display text-4xl leading-none tracking-[-0.055em] text-[#294332] focus:outline-none sm:text-5xl">
                {selectedProduct.name}
              </h2>
              <p className="mt-5 max-w-md leading-7 text-[#536459]">{selectedProduct.description}</p>

              {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                <ProductVariants className="mt-6" productName={selectedProduct.name} variants={selectedProduct.variants} />
              ) : null}

              <dl className="mt-7 grid grid-cols-2 border-t border-[#314B3A]/10">
                {[
                  [copy.detail.age, selectedProduct.age],
                  [copy.detail.wood, selectedProduct.wood],
                  [copy.detail.dimensions, selectedProduct.dimensions],
                  [copy.detail.finish, selectedProduct.finish],
                  [copy.detail.contents, selectedProduct.contents],
                  [copy.detail.care, selectedProduct.care],
                ].map(([label, value]) => (
                  <div key={label} className={`border-b border-[#314B3A]/10 py-4 ${detailCellClasses}`}>
                    <dt className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">{label}</dt>
                    <dd className="mt-1.5 text-sm font-semibold leading-5 text-[#405047]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
