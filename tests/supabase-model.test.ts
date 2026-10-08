import assert from "node:assert/strict";
import { test } from "node:test";

import {
  mapVariantRows,
  resolveTranslationName,
  rowsToManagedProducts,
  toManagedProductFromRow,
  variantPriceText,
  type SupabaseProductRow,
} from "../src/lib/supabase-model.ts";

const buildUrl = (storagePath: string) =>
  storagePath.startsWith("/")
    ? storagePath
    : "https://contoh.supabase.co/storage/v1/object/public/produk/" + storagePath;

function baseRow(): SupabaseProductRow {
  return {
    id: 9,
    slug: "mainan-baru",
    status: "published",
    sort_order: 9,
    surface: "#F9E2BE",
    accent: "#D88653",
    illustration: "blocks",
    translations: [
      { language_id: "id", name: "Mainan Baru", description: "Deskripsi ID", dimensions: "10 × 10 cm", contents: "1 buah", care: "Lap bersih." },
      { language_id: "en", name: "New Toy", description: "Deskripsi EN", dimensions: "10 × 10 cm", contents: "1 piece", care: "Wipe clean." },
      { language_id: "ar", name: "لعبة جديدة", description: "وصف", dimensions: "١٠ × ١٠ سم", contents: "قطعة واحدة", care: "يُمسح." },
    ],
    categories: [
      {
        is_primary: true,
        category: {
          slug: "main-sambil-belajar",
          translations: [
            { language_id: "id", name: "Main sambil belajar" },
            { language_id: "en", name: "Learn through play" },
            { language_id: "ar", name: "التعلّم باللعب" },
          ],
        },
      },
    ],
    ages: [{ age_range: { min_months: 12, max_months: 48 } }],
    images: [{ id: 1, storage_path: "/images/products/koleksi.jpeg", alt_text: null, sort_order: 0, is_primary: true }],
    material: {
      code: "kayu-pinus-solid",
      translations: [
        { language_id: "id", name: "Kayu pinus solid" },
        { language_id: "en", name: "Solid pine wood" },
        { language_id: "ar", name: "خشب صنوبر صلب" },
      ],
    },
    finishing: {
      code: "cat-air-matte",
      translations: [
        { language_id: "id", name: "Cat berbasis air, lapisan matte" },
        { language_id: "en", name: "Water-based paint, matte finish" },
        { language_id: "ar", name: "طلاء مائي بتشطيب مطفي" },
      ],
    },
    variants: [],
  };
}

test("baris relasional dirakit menjadi ManagedProduct dengan teks per bahasa", () => {
  const product = toManagedProductFromRow(baseRow(), buildUrl);

  assert.equal(product.documentId, "9");
  assert.equal(product.id, 9);
  assert.equal(product.slug, "mainan-baru");
  assert.equal(product.status, "published");
  assert.equal(product.order, 9);
  assert.equal(product.translations.id.name, "Mainan Baru");
  assert.equal(product.translations.en.name, "New Toy");
  assert.equal(product.translations.ar.category, "التعلّم باللعب");
  assert.equal(product.translations.id.category, "Main sambil belajar");
  assert.equal(product.translations.id.wood, "Kayu pinus solid");
  assert.equal(product.translations.en.wood, "Solid pine wood");
  assert.equal(product.translations.en.finish, "Water-based paint, matte finish");
  assert.equal(product.translations.id.age, "1–4 tahun");
  assert.equal(product.translations.en.age, "1–4 years");
  assert.equal(product.translations.ar.age, "١–٤ سنوات");
});

test("foto statis dibiarkan apa adanya; foto storage menjadi alamat publik", () => {
  const statis = toManagedProductFromRow(baseRow(), buildUrl);
  assert.equal(statis.imageUrl, "/images/products/koleksi.jpeg");
  assert.equal(statis.imagePath, undefined);

  const row = baseRow();
  row.images = [{ id: 2, storage_path: "products/9-123.jpg", alt_text: null, sort_order: 0, is_primary: true }];
  const unggahan = toManagedProductFromRow(row, buildUrl);
  assert.equal(unggahan.imageUrl, "https://contoh.supabase.co/storage/v1/object/public/produk/products/9-123.jpg");
  assert.equal(unggahan.imagePath, "products/9-123.jpg");
});

test("ilustrasi tak dikenal jatuh ke 'mainan'", () => {
  const row = baseRow();
  row.illustration = "tidak-ada";
  assert.equal(toManagedProductFromRow(row, buildUrl).illustration, "mainan");
});

test("varian: label dari bahasa permintaan, harga dari catatan teks", () => {
  const row = baseRow();
  row.variants = [
    {
      id: 2,
      code: "5-cm",
      sort_order: 1,
      is_active: true,
      translations: [
        { language_id: "id", name: "5 cm" },
        { language_id: "en", name: "5 cm" },
      ],
      prices: [{ price: 5, price_note: "$5 / 10 pcs", is_active: true, currency: { code: "USD", symbol: "$" } }],
    },
    {
      id: 1,
      code: "3-cm",
      sort_order: 0,
      is_active: true,
      translations: [
        { language_id: "id", name: "3 cm" },
        { language_id: "en", name: "3 cm" },
      ],
      prices: [{ price: 4, price_note: "$4 / 10 pcs", is_active: true, currency: { code: "USD", symbol: "$" } }],
    },
    {
      id: 3,
      code: "lama",
      sort_order: 2,
      is_active: false,
      translations: [{ language_id: "id", name: "Lama" }],
      prices: [],
    },
  ];

  const managed = toManagedProductFromRow(row, buildUrl);
  assert.deepEqual(managed.variants, [
    { label: "3 cm", price: "$4 / 10 pcs" },
    { label: "5 cm", price: "$5 / 10 pcs" },
  ]);

  const english = mapVariantRows(row.variants, "en");
  assert.equal(english[0].label, "3 cm");
});

test("variantPriceText: catatan teks menang, angka tanpa catatan pakai simbol", () => {
  assert.equal(variantPriceText(undefined), "");
  assert.equal(
    variantPriceText({ price: 4, price_note: "$4 / 10 pcs", is_active: true, currency: { code: "USD", symbol: "$" } }),
    "$4 / 10 pcs",
  );
  assert.equal(
    variantPriceText({ price: 4, price_note: "", is_active: true, currency: { code: "USD", symbol: "$" } }),
    "$4",
  );
  assert.equal(
    variantPriceText({ price: 4.5, price_note: "  ", is_active: true, currency: { code: "USD", symbol: "$" } }),
    "$4.50",
  );
});

test("resolveTranslationName: bahasa diminta -> Indonesia -> entri pertama", () => {
  assert.equal(resolveTranslationName(null, "en"), "");
  assert.equal(resolveTranslationName([{ language_id: "id", name: "Halo" }], "en"), "Halo");
  assert.equal(resolveTranslationName([{ language_id: "ar", name: "مرحبا" }], "en"), "مرحبا");
  assert.equal(resolveTranslationName([{ language_id: "id", name: "" }, { language_id: "ar", name: "مرحبا" }], "en"), "مرحبا");
});

test("rowsToManagedProducts mengurutkan berdasarkan urutan", () => {
  const first = baseRow();
  first.id = 11;
  first.slug = "kedua";
  first.sort_order = 2;

  const second = baseRow();
  second.id = 10;
  second.slug = "pertama";
  second.sort_order = 1;

  const products = rowsToManagedProducts([first, second], buildUrl);
  assert.deepEqual(products.map((item) => item.slug), ["pertama", "kedua"]);
});
