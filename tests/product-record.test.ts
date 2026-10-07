import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createEmptyTranslation,
  getLocalizedProduct,
  isValidProductRecord,
  normalizeVariants,
  toManagedProduct,
  type ProductRecord,
} from "../src/lib/product-record.ts";

function goodRecord(overrides: Partial<ProductRecord> = {}): ProductRecord {
  return {
    id: 1,
    surface: "#F9E2BE",
    accent: "#D88653",
    illustration: "rainbow",
    status: "published",
    order: 1,
    translations: {
      id: { ...createEmptyTranslation(), name: "Pelangi Susun", category: "Main sambil belajar" },
      en: { ...createEmptyTranslation(), name: "Stacking Rainbow", category: "Learn through play" },
      ar: { ...createEmptyTranslation(), name: "قوس قزح قابل للتركيب", category: "التعلّم باللعب" },
    },
    ...overrides,
  };
}

test("isValidProductRecord menerima dokumen yang benar", () => {
  assert.equal(isValidProductRecord(goodRecord()), true);
});

test("isValidProductRecord menolak nilai yang bukan objek", () => {
  assert.equal(isValidProductRecord(null), false);
  assert.equal(isValidProductRecord(undefined), false);
  assert.equal(isValidProductRecord("produk"), false);
  assert.equal(isValidProductRecord([]), false);
});

test("isValidProductRecord menolak field wajib yang hilang atau salah tipe", () => {
  const missingOrder = { ...goodRecord() } as Record<string, unknown>;
  delete missingOrder.order;
  assert.equal(isValidProductRecord(missingOrder), false);

  assert.equal(isValidProductRecord({ ...goodRecord(), id: "1" }), false);
  assert.equal(isValidProductRecord({ ...goodRecord(), id: 0 }), false);
  assert.equal(isValidProductRecord({ ...goodRecord(), id: 2.5 }), false);
  assert.equal(isValidProductRecord({ ...goodRecord(), surface: "oranye" }), false);
  assert.equal(isValidProductRecord({ ...goodRecord(), accent: "#12345" }), false);
  assert.equal(isValidProductRecord({ ...goodRecord(), order: "1" }), false);
  assert.equal(isValidProductRecord({ ...goodRecord(), status: "arsip" }), false);
  assert.equal(isValidProductRecord({ ...goodRecord(), illustration: "pesawat" }), false);
  assert.equal(isValidProductRecord({ ...goodRecord(), imageUrl: 7 }), false);
});

test("isValidProductRecord tetap menerima terjemahan en/ar yang belum lengkap", () => {
  // Fallback berlapis di getLocalizedProduct masih bisa menampilkan produk ini,
  // jadi dokumen tidak dibuang hanya karena satu bahasa belum diisi.
  const partial = {
    ...goodRecord(),
    translations: {
      id: { ...createEmptyTranslation(), name: "Pelangi Susun" },
    },
  };

  assert.equal(isValidProductRecord(partial), true);
});

test("isValidProductRecord menolak terjemahan id yang tidak berbentuk objek", () => {
  assert.equal(isValidProductRecord({ ...goodRecord(), translations: {} }), false);
  assert.equal(isValidProductRecord({ ...goodRecord(), translations: { id: "bukan objek" } }), false);
  assert.equal(
    isValidProductRecord({ ...goodRecord(), translations: { id: { name: 5 } } }),
    false,
  );
});

test("toManagedProduct mengembalikan null untuk dokumen cacat", () => {
  assert.equal(toManagedProduct("1", { id: 1 }), null);

  const managed = toManagedProduct("1", goodRecord());
  assert.ok(managed);
  assert.equal(managed.documentId, "1");
});

test("getLocalizedProduct memakai bahasa yang diminta", () => {
  assert.equal(getLocalizedProduct(goodRecord(), "id").name, "Pelangi Susun");
  assert.equal(getLocalizedProduct(goodRecord(), "en").name, "Stacking Rainbow");
  assert.equal(getLocalizedProduct(goodRecord(), "ar").name, "قوس قزح قابل للتركيب");
});

test("getLocalizedProduct mempertahankan warna dan ilustrasi dari dokumen", () => {
  const product = getLocalizedProduct(goodRecord({ surface: "#000000", accent: "#FFFFFF" }), "en");
  assert.equal(product.surface, "#000000");
  assert.equal(product.accent, "#FFFFFF");
  assert.equal(product.illustration, "rainbow");
});

test("getLocalizedProduct jatuh ke bahasa Indonesia bila bahasa lain kosong", () => {
  const record = goodRecord();
  record.translations.en = createEmptyTranslation();

  const product = getLocalizedProduct(record, "en");
  assert.equal(product.name, "Pelangi Susun");
});

test("getLocalizedProduct jatuh ke katalog statis bila semua terjemahan kosong", () => {
  const record = goodRecord({
    translations: {
      id: createEmptyTranslation(),
      en: createEmptyTranslation(),
      ar: createEmptyTranslation(),
    },
  });

  const product = getLocalizedProduct(record, "en");
  assert.equal(product.name, "Stacking Rainbow");
  assert.equal(product.surface, "#F9E2BE");
});

test("getLocalizedProduct tidak pernah mengembalikan nama kosong", () => {
  const record = goodRecord({
    id: 99,
    translations: {
      id: createEmptyTranslation(),
      en: createEmptyTranslation(),
      ar: createEmptyTranslation(),
    },
  });

  const product = getLocalizedProduct(record, "id");
  assert.equal(typeof product.name, "string");
  assert.equal(product.name, "");
  assert.equal(product.id, 99);
});

test("isValidProductRecord menerima variants dan menolak yang bukan daftar", () => {
  assert.equal(isValidProductRecord({ ...goodRecord(), variants: [] }), true);
  assert.equal(
    isValidProductRecord({ ...goodRecord(), variants: [{ label: "3 cm", price: "$4 / 10 pcs" }] }),
    true,
  );
  assert.equal(isValidProductRecord({ ...goodRecord(), variants: "3 cm" }), false);
  assert.equal(isValidProductRecord({ ...goodRecord(), variants: [{ label: 3 }] }), true);
});

test("normalizeVariants menyaring baris cacat tanpa menjatuhkan produk", () => {
  assert.deepEqual(normalizeVariants(undefined), []);
  assert.deepEqual(normalizeVariants("bukan daftar"), []);
  assert.deepEqual(
    normalizeVariants([
      { label: " 3 cm ", price: " $4 " },
      { label: "", price: "$5" },
      null,
      { price: "$6" },
      { label: "5 cm", price: 7 },
    ]),
    [{ label: "3 cm", price: "$4" }, { label: "5 cm", price: "" }],
  );
});

test("getLocalizedProduct melewatkan variants dari dokumen", () => {
  const product = getLocalizedProduct(
    { ...goodRecord(), variants: [{ label: "3 cm", price: "$4 / 10 pcs" }] },
    "id",
  );

  assert.deepEqual(product.variants, [{ label: "3 cm", price: "$4 / 10 pcs" }]);
  assert.deepEqual(getLocalizedProduct(goodRecord(), "id").variants, []);
});
