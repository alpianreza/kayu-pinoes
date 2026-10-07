import type { Metadata } from "next";

import { ContactView } from "@/components/site/ContactView";
import { DEFAULT_LANGUAGE } from "@/lib/i18n";
import { languageAlternates, languageMetadata } from "@/lib/locale-metadata";

export const metadata: Metadata = {
  title: "Contact & how to order — Kayu Pinoes",
  description:
    "How to order Kayu Pinoes wooden toys: tell us which piece you like, and we reply over WhatsApp.",
  alternates: {
    canonical: "/contact",
    languages: languageAlternates("/contact"),
  },
  openGraph: {
    url: "/contact",
    title: "Contact & how to order — Kayu Pinoes",
    description:
      "How to order Kayu Pinoes wooden toys: tell us which piece you like, and we reply over WhatsApp.",
    locale: languageMetadata[DEFAULT_LANGUAGE].ogLocale,
  },
};

export default function ContactPage() {
  return <ContactView />;
}
