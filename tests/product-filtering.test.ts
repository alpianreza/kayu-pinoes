import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_PRODUCT_FILTERS,
  filterProducts,
  hasVariantPrice,
  nextStatus,
  productPriceSummary,
  type ProductFilterState,
} from "../src/lib/product-filtering.ts";
import {
  createEmptyTranslation,
  type ManagedProduct,
  type ProductStatus,
} from "../src/lib/product-record.ts";

function product(
  id: number,
  overrides: Partial<ManagedProduct> = {},
): ManagedProduct {
  return {
    documentId: String(id),
    id,
    surface: "#F9E2BE",
    accent: "#D88653",
    illustration: "mainan",
    status: "published",
    order: id,
    translations: {
      id: { ...createEmptyTranslation(), name: `Produk ${id}` },
      en: { ...createEmptyTranslation(), name: `Product ${id}` },
      ar: { ...createEmptyTranslation(), name: `منتج ${id}` },
    },
    ...overrides,
  };
}

const CATALOG = [
  product(1, {
    slug: "pelangi",
    translations: {
      id: { ...createEmptyTranslation(), name: "Menara Pelangi", category: "Kerajinan", age: "2-4 tahun" },
      en: { ...createEmptyTranslation(), name: "Rainbow Tower" },
      ar: { ...createEmptyTranslation(), name: "منتج 1" },
    },
  }),
  product(2, {
    status: "draft",
    slug: "mobil",
    translations: {
      id: { ...createEmptyTranslation(), name: "Mobil Kayu", category: "Kendaraan", age: "3-6 tahun" },
      en: { ...createEmptyTranslation(), name: "Wood Car" },
      ar: { ...createEmptyTranslation(), name: "منتج 2" },
    },
  }),
  product(3, {
    slug: "mobil-kecil",
    translations: {
      id: { ...createEmptyTranslation(), name: "Mobil Kecil", category: "Kendaraan", age: "3-6 tahun" },
      en: { ...createEmptyTranslation(), name: "Little Car" },
      ar: { ...createEmptyTranslation(), name: "منتج 3" },
    },
  }),
];

function filters(overrides: Partial<ProductFilterState> = {}): ProductFilterState {
  return { ...DEFAULT_PRODUCT_FILTERS, ...overrides };
}

test("filterProducts tanpa filter mengembalikan semua produk terurut sesuai order", () => {
  const result = filterProducts(CATALOG, filters());
  assert.deepEqual(
    result.map((item) => item.id),
    [1, 2, 3],
  );
});

test("filterProducts mencari nama Indonesia, bahasa Inggris, slug, atau nomor", () => {
  const byNameId = filterProducts(CATALOG, filters({ search: "mobil" }));
  assert.deepEqual(byNameId.map((item) => item.id), [2, 3]);

  const byNameEn = filterProducts(CATALOG, filters({ search: "wood car" }));
  assert.deepEqual(byNameEn.map((item) => item.id), [2]);

  const bySlug = filterProducts(CATALOG, filters({ search: "pelangi" }));
  assert.deepEqual(bySlug.map((item) => item.id), [1]);

  const byId = filterProducts(CATALOG, filters({ search: "3" }));
  assert.deepEqual(byId.map((item) => item.id), [3]);

  assert.equal(filterProducts(CATALOG, filters({ search: "tidak-ada" })).length, 0);
});

test("filterProducts memisahkan status published dan draft", () => {
  assert.deepEqual(
    filterProducts(CATALOG, filters({ status: "published" })).map((item) => item.id),
    [1, 3],
  );
  assert.deepEqual(
    filterProducts(CATALOG, filters({ status: "draft" })).map((item) => item.id),
    [2],
  );
});

test("filterProducts menyaring kategori dan usia dari terjemahan Indonesia", () => {
  assert.deepEqual(
    filterProducts(CATALOG, filters({ category: "Kendaraan" })).map((item) => item.id),
    [2, 3],
  );
  assert.deepEqual(
    filterProducts(CATALOG, filters({ age: "2-4 tahun" })).map((item) => item.id),
    [1],
  );
});

test("filterProducts memakai filter gabungan sekaligus", () => {
  assert.deepEqual(
    filterProducts(CATALOG, filters({ status: "published", category: "Kendaraan" })).map((item) => item.id),
    [3],
  );
});

test("sortProducts: nama A-Z, ID terlama, dan ID terbaru", () => {
  const shuffled = [product(5), product(2), product(9)];
  shuffled.forEach((item, index) => {
    item.translations.id = {
      ...createEmptyTranslation(),
      name: ["Zebra", "Apa", "Midi"][index],
    };
  });

  assert.deepEqual(
    filterProducts(shuffled, filters({ sortBy: "name" })).map((item) => item.id),
    [2, 9, 5],
  );
  assert.deepEqual(
    filterProducts(shuffled, filters({ sortBy: "id_asc" })).map((item) => item.id),
    [2, 5, 9],
  );
  assert.deepEqual(
    filterProducts(shuffled, filters({ sortBy: "id_desc" })).map((item) => item.id),
    [9, 5, 2],
  );
});

test("nextStatus membalik antara published dan draft", () => {
  assert.equal(nextStatus("published"), "draft");
  assert.equal(nextStatus("draft"), "published");
});

test("hasVariantPrice: produk tanpa harga memakai Hubungi Kami", () => {
  assert.equal(hasVariantPrice({ variants: [] }), false);
  assert.equal(hasVariantPrice({ variants: [{ label: "S", price: "" }] }), false);
  assert.equal(hasVariantPrice({ variants: [{ label: "S", price: "  " }] }), false);
  assert.equal(hasVariantPrice({ variants: [{ label: "S", price: "Rp 200.000" }] }), true);
});

test("productPriceSummary mengambil harga varian pertama yang terisi", () => {
  assert.equal(productPriceSummary({ variants: [] }), "Hubungi Kami");
  assert.equal(productPriceSummary({ variants: [{ label: "S", price: "" }] }), "Hubungi Kami");
  assert.equal(
    productPriceSummary({
      variants: [
        { label: "S", price: "" },
        { label: "L", price: "Rp 500.000" },
      ],
    }),
    "Rp 500.000",
  );
});

test("status ProductStatus punya dua nilai saja", () => {
  const status: ProductStatus = "draft";
  assert.ok(status === "draft" || status === "published");
});
