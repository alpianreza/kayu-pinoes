import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isStorageImagePath,
  productDocumentId,
  stripDocumentId,
} from "../src/lib/product-admin-model.ts";
import { createEmptyTranslation, type ManagedProduct } from "../src/lib/product-record.ts";

function managedProduct(overrides: Partial<ManagedProduct> = {}): ManagedProduct {
  return {
    documentId: "7",
    id: 7,
    slug: "melody-xylophone",
    surface: "#F1DDE0",
    accent: "#B76B78",
    illustration: "blocks",
    translations: {
      id: { ...createEmptyTranslation(), name: "Xilofon Melodi" },
      en: { ...createEmptyTranslation(), name: "Melody Xylophone" },
      ar: { ...createEmptyTranslation(), name: "زيلوفون" },
    },
    status: "published",
    order: 7,
    ...overrides,
  };
}

test("productDocumentId is the numeric id written as text", () => {
  assert.equal(productDocumentId(7), "7");
  assert.equal(productDocumentId(12), "12");
});

/**
 * Penyangga untuk bug nyata: stripDocumentId dulu menjatuhkan `slug`.
 * Karena swapProductOrder menulis ulang seluruh dokumen hasil fungsi ini,
 * setiap kali admin menukar urutan, alamat halaman produk itu ikut hilang.
 */
test("stripDocumentId keeps every data field including slug", () => {
  const record = stripDocumentId(managedProduct({ imageUrl: "https://x/y.png", imagePath: "products/7-1.png" }));

  assert.equal("documentId" in record, false, "documentId must not be written into the document");
  assert.equal(record.slug, "melody-xylophone");
  assert.equal(record.id, 7);
  assert.equal(record.order, 7);
  assert.equal(record.status, "published");
  assert.equal(record.surface, "#F1DDE0");
  assert.equal(record.accent, "#B76B78");
  assert.equal(record.illustration, "blocks");
  assert.equal(record.translations.en.name, "Melody Xylophone");
  assert.equal(record.imageUrl, "https://x/y.png");
  assert.equal(record.imagePath, "products/7-1.png");
});

test("stripDocumentId omits optional fields that are absent", () => {
  const record = stripDocumentId(managedProduct({ slug: undefined, imageUrl: undefined, imagePath: undefined }));

  assert.equal("slug" in record, false);
  assert.equal("imageUrl" in record, false);
  assert.equal("imagePath" in record, false);
});

test("empty optional values are dropped, not stored as blank strings", () => {
  const record = stripDocumentId(managedProduct({ slug: "", imageUrl: "", imagePath: "" }));

  assert.equal("slug" in record, false);
  assert.equal("imageUrl" in record, false);
  assert.equal("imagePath" in record, false);
});

/**
 * Penghapusan berkas hanya boleh menyasar objek hasil unggahan sendiri:
 * storage.rules mengizinkan products/{nama}, dan path di folder public atau
 * URL luar tidak ada artinya bagi Storage.
 */
test("isStorageImagePath accepts only uploaded product objects", () => {
  assert.equal(isStorageImagePath("products/7-1730000000000.jpg"), true);
  assert.equal(isStorageImagePath("products/produk-baru-1730000000000.png"), true);
});

test("isStorageImagePath rejects everything else", () => {
  assert.equal(isStorageImagePath("/images/products/foto.jpeg"), false);
  assert.equal(isStorageImagePath("https://cdn.example.com/a.jpg"), false);
  assert.equal(isStorageImagePath("products/nested/deep.jpg"), false);
  assert.equal(isStorageImagePath("other/file.jpg"), false);
  assert.equal(isStorageImagePath(""), false);
  assert.equal(isStorageImagePath(undefined), false);
  assert.equal(isStorageImagePath(null), false);
});

/**
 * Pelajaran yang sama dengan slug: field apa pun yang tidak ikut disalin
 * akan terhapus diam-diam saat admin menukar urutan produk.
 */
test("stripDocumentId keeps variants", () => {
  const record = stripDocumentId(
    managedProduct({ variants: [{ label: "3 cm", price: "$4 / 10 pcs" }] }),
  );

  assert.deepEqual(record.variants, [{ label: "3 cm", price: "$4 / 10 pcs" }]);
});

test("stripDocumentId omits variants when there are none", () => {
  const record = stripDocumentId(managedProduct({ variants: [] }));
  assert.equal("variants" in record, false);
});
