import assert from "node:assert/strict";
import { test } from "node:test";

import type { Product } from "../src/lib/products.ts";
import {
  absoluteImageUrl,
  breadcrumbJsonLd,
  normalizeBaseUrl,
  organizationJsonLd,
  productJsonLd,
} from "../src/lib/seo.ts";

const base = "https://kayupinoes.com";

function contohProduk(): Product {
  return {
    id: 1,
    slug: "contoh-produk",
    name: "Contoh Produk",
    category: "Mainan",
    age: "1–4 tahun",
    description: "Deskripsi contoh.",
    wood: "Kayu pinus solid",
    dimensions: "10 cm",
    finish: "",
    contents: "",
    care: "",
    surface: "#FBF9F3",
    accent: "#314B3A",
    illustration: "mainan",
    imageUrl: "/images/products/contoh.webp",
  };
}

test("normalizeBaseUrl memangkas spasi dan garis miring di akhir", () => {
  assert.equal(normalizeBaseUrl("  https://kayupinoes.com///  "), "https://kayupinoes.com");
  assert.equal(normalizeBaseUrl(""), "");
  assert.equal(normalizeBaseUrl(null), "");
});

test("absoluteImageUrl menggabungkan path lokal dan membiarkan URL penuh", () => {
  assert.equal(absoluteImageUrl("/images/a.png", base), "https://kayupinoes.com/images/a.png");
  assert.equal(absoluteImageUrl("images/a.png", base), "https://kayupinoes.com/images/a.png");
  assert.equal(
    absoluteImageUrl("https://contoh.co/storage/a.webp", base),
    "https://contoh.co/storage/a.webp",
  );
});

test("organizationJsonLd memuat kontak WhatsApp bila nomornya diisi", () => {
  const data = organizationJsonLd({ siteUrl: base, whatsappNumber: "6289622022910" });
  assert.equal(data["@type"], "Organization");
  assert.equal(data.url, "https://kayupinoes.com/");
  assert.equal(data.logo, "https://kayupinoes.com/images/brand/logo-mark.png");
  assert.deepEqual(data.sameAs, ["https://instagram.com/kayupinoes"]);
  assert.equal(data.contactPoint?.[0]?.telephone, "+6289622022910");
  assert.equal(data.contactPoint?.[0]?.url, "https://wa.me/6289622022910");
});

test("organizationJsonLd tidak mengarang kontak bila nomor kosong", () => {
  const data = organizationJsonLd({ siteUrl: base, whatsappNumber: null });
  assert.equal(data.contactPoint, undefined);
});

test("productJsonLd memuat medan produk dan gambar absolut", () => {
  const data = productJsonLd(contohProduk(), base);
  assert.equal(data["@type"], "Product");
  assert.equal(data.name, "Contoh Produk");
  assert.equal(data.url, "https://kayupinoes.com/products/contoh-produk");
  assert.equal(data.material, "Kayu pinus solid");
  assert.deepEqual(data.image, ["https://kayupinoes.com/images/products/contoh.webp"]);
});

test("productJsonLd melewatkan gambar bila produk belum punya foto", () => {
  const data = productJsonLd({ ...contohProduk(), imageUrl: undefined }, base);
  assert.equal(data.image, undefined);
});

test("breadcrumbJsonLd memberi posisi berurutan", () => {
  const data = breadcrumbJsonLd([
    { name: "Home", url: base + "/" },
    { name: "Catalog", url: base + "/products" },
    { name: "Contoh Produk", url: base + "/products/contoh-produk" },
  ]);
  assert.equal(data.itemListElement.length, 3);
  assert.equal(data.itemListElement[0].position, 1);
  assert.equal(data.itemListElement[2].name, "Contoh Produk");
});
