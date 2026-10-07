import assert from "node:assert/strict";
import { test } from "node:test";

import { getLocalizedProducts, supportedLanguages, translations } from "../src/lib/catalog-i18n.ts";
import { productSeeds } from "../src/lib/products.ts";

const TEXT_KEYS = [
  "name",
  "category",
  "age",
  "description",
  "wood",
  "dimensions",
  "finish",
  "contents",
  "care",
] as const;

test("katalog statis berisi delapan produk", () => {
  assert.equal(productSeeds.length, 8);
  assert.equal(getLocalizedProducts("id").length, 8);
});

test("setiap bahasa memberi nama produk yang benar", () => {
  assert.equal(getLocalizedProducts("id")[0].name, "Pelangi Susun");
  assert.equal(getLocalizedProducts("en")[0].name, "Stacking Rainbow");
  assert.equal(getLocalizedProducts("ar")[0].name, "قوس قزح قابل للتركيب");
});

test("produk baru punya nama di ketiga bahasa", () => {
  for (const [language, expected] of [
    ["id", "Menara Angka"],
    ["en", "Number Tower"],
    ["ar", "برج الأرقام"],
  ] as const) {
    const product = getLocalizedProducts(language).find((item) => item.id === 5);
    assert.ok(product, `produk 5 tidak ada di bahasa ${language}`);
    assert.equal(product.name, expected);
  }
});

test("setiap produk lengkap di ketiga bahasa", () => {
  for (const language of supportedLanguages) {
    const products = getLocalizedProducts(language);
    assert.equal(products.length, 8);

    for (const product of products) {
      for (const key of TEXT_KEYS) {
        const value = product[key];
        assert.equal(typeof value, "string", `${language} id ${product.id} field ${key}`);
        assert.ok(value.trim().length > 0, `${language} id ${product.id} field ${key} kosong`);
      }
    }
  }
});

test("setiap produk punya foto yang berbeda", () => {
  const images = getLocalizedProducts("en").map((product) => product.imageUrl);
  assert.equal(images.length, 8);
  for (const image of images) {
    assert.equal(typeof image, "string");
    assert.ok((image ?? "").startsWith("/images/products/"), `path foto tidak wajar: ${image}`);
  }
  assert.equal(new Set(images).size, 8, "ada foto yang dipakai lebih dari satu produk");
});

test("warna dan ilustrasi diambil dari seed, bukan dari terjemahan", () => {
  const products = getLocalizedProducts("en");

  for (const seed of productSeeds) {
    const product = products.find((item) => item.id === seed.id);
    assert.ok(product);
    assert.equal(product.surface, seed.surface);
    assert.equal(product.accent, seed.accent);
    assert.equal(product.illustration, seed.illustration);
  }
});

test("id produk berurutan tanpa lompatan", () => {
  const ids = getLocalizedProducts("id").map((product) => product.id);
  assert.deepEqual(ids, [1, 2, 3, 4, 5, 6, 7, 8]);
});

test("setiap produk punya alamat ramah mesin pencari", () => {
  const slugs = getLocalizedProducts("en").map((product) => product.slug);
  assert.equal(slugs.length, 8);

  for (const slug of slugs) {
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `alamat tidak wajar: ${slug}`);
  }

  assert.equal(new Set(slugs).size, 8, "ada alamat yang dipakai lebih dari satu produk");
});

test("alamat produk sama di ketiga bahasa", () => {
  const indonesian = getLocalizedProducts("id").map((product) => product.slug);
  const english = getLocalizedProducts("en").map((product) => product.slug);
  const arabic = getLocalizedProducts("ar").map((product) => product.slug);

  assert.deepEqual(indonesian, english);
  assert.deepEqual(english, arabic);
});

test("pendekatan alternatif: alamat bawaan cocok dengan id produk", () => {
  for (const seed of productSeeds) {
    const product = getLocalizedProducts("en").find((item) => item.id === seed.id);
    assert.ok(product);
    assert.equal(product.slug, seed.slug);
  }
});

test("daftar bahasa yang didukung tidak berubah tanpa sengaja", () => {
  assert.deepEqual([...supportedLanguages], ["id", "en", "ar"]);
  assert.deepEqual(Object.keys(translations).sort(), ["ar", "en", "id"]);
});
