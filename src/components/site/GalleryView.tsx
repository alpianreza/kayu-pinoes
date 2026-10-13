"use client";

import { Camera } from "lucide-react";
import { useEffect, useState } from "react";

import { ProductImage } from "@/components/site/ProductImage";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { useLanguage } from "@/components/site/LanguageProvider";
import { languageDirections } from "@/lib/locale-metadata";
import { siteCopy } from "@/lib/site-copy";
import { fetchGalleryPhotos, type GalleryPhoto } from "@/lib/supabase-gallery";

/**
 * Halaman galeri publik: kumpulan foto proses pembuatan.
 *
 * Foto dibaca langsung dari folder `gallery/` di bucket "produk" milik
 * server data, jadi tidak ada daftar terpisah yang harus dijaga admin.
 */
export function GalleryView() {
  const { language } = useLanguage();
  const copy = siteCopy[language].gallery;
  const [photos, setPhotos] = useState<GalleryPhoto[] | null>(null);

  useEffect(() => {
    let active = true;

    fetchGalleryPhotos()
      .then((next) => {
        if (active) setPhotos(next);
      })
      .catch(() => {
        if (active) setPhotos([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div lang={language} dir={languageDirections(language)} className="min-h-dvh bg-[#FBF9F3] text-[#27372D]">
      <SiteHeader active="/gallery" />

      <main id="content">
        <section className="mx-auto max-w-7xl px-5 pb-7 pt-9 sm:px-8 lg:px-10 lg:pt-12">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#C76845]">{copy.eyebrow}</p>
          <h1 className="font-display max-w-3xl text-3xl leading-[1.02] tracking-[-0.055em] text-[#294332] sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-[#536459]">{copy.intro}</p>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
          {photos === null ? (
            <p aria-busy="true" className="text-sm font-bold text-[#6B766E]">
              {copy.loading}
            </p>
          ) : photos.length === 0 ? (
            <div className="rounded-[1.7rem] border border-dashed border-[#314B3A]/20 bg-white p-10 text-center sm:p-14">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#EEF1E9] text-[#456C4D]">
                <Camera size={22} />
              </span>
              <p className="mt-4 text-base font-bold leading-7 text-[#6B766E]">{copy.empty}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {photos.map((photo, index) => (
                <a
                  key={photo.path}
                  href={photo.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden rounded-[1.25rem] border border-[#314B3A]/10 bg-[#E8EBDD] sm:rounded-[1.7rem]"
                >
                  <ProductImage
                    src={photo.imageUrl}
                    alt={`${copy.eyebrow} ${index + 1}`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </a>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
