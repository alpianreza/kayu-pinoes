"use client";

import Link from "next/link";

import { OrderButton } from "@/components/site/OrderButton";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { useLanguage } from "@/components/site/LanguageProvider";
import { useCatalogue } from "@/components/site/useCatalogue";
import { languageDirections } from "@/lib/locale-metadata";
import { Button } from "@/components/ui/button";
import { siteCopy } from "@/lib/site-copy";
import { formatWhatsappNumber } from "@/lib/whatsapp";

export function ContactView() {
  const { language } = useLanguage();
  const copy = siteCopy[language].contact;
  const numberLabel = formatWhatsappNumber();
  // Sama seperti halaman tentang: angka pada ajakan mengikuti katalog aktif.
  const { products } = useCatalogue(language);

  return (
    <div lang={language} dir={languageDirections(language)} className="min-h-dvh bg-[#FBF9F3] text-[#27372D]">
      <SiteHeader active="/contact" />

      <main id="content">
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-9 sm:px-8 lg:px-10 lg:pt-12">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#C76845]">{copy.eyebrow}</p>
          <h1 className="font-display max-w-2xl text-4xl leading-[1.02] tracking-[-0.055em] text-[#294332] sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-[#536459]">{copy.intro}</p>
        </section>

        <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
            <div className="grid gap-4 border-y border-[#314B3A]/10 py-9 sm:grid-cols-3">
              {copy.steps.map((step, index) => (
                <div key={step.title}>
                  <span className="font-display text-3xl text-[#D98B64]">0{index + 1}</span>
                  <h2 className="font-display mt-2 text-xl tracking-[-0.035em] text-[#334139]">{step.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#68766D]">{step.copy}</p>
                </div>
              ))}
            </div>

            <aside className="rounded-[1.7rem] border border-[#314B3A]/10 bg-white p-6 sm:p-7">
              <h2 className="font-display text-2xl tracking-[-0.04em] text-[#334139]">{copy.asideTitle}</h2>

              <p className="mt-3 text-sm leading-6 text-[#68766D]">{copy.configuredBody}</p>
              <OrderButton className="mt-6 w-full" label={siteCopy[language].order.chat} />
              {numberLabel ? (
                <p className="mt-4 text-xs leading-5 text-[#8A948C]">
                  {copy.destination}: {numberLabel}
                </p>
              ) : null}

              <div className="mt-7 border-t border-[#314B3A]/10 pt-5">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">{copy.beforeTitle}</p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#68766D]">
                  {copy.before.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-6 rounded-[2.2rem] bg-[#314B3A] px-7 py-10 text-[#F9F4E8] sm:flex-row sm:items-end sm:px-10">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#F4C45D]">{copy.ctaEyebrow}</p>
              <h2 className="font-display mt-3 max-w-xl text-3xl leading-[1.05] tracking-[-0.05em] sm:text-4xl">
                {copy.ctaTitle(products.length)}
              </h2>
            </div>
            <Button asChild size="lg" className="bg-[#F9F4E8] text-[#314B3A] shadow-none hover:bg-white">
              <Link href="/products">{copy.ctaButton}</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
