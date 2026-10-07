import assert from "node:assert/strict";
import { test } from "node:test";

import {
  matchesAgeBucket,
  matchesQuery,
  maxAgeOf,
  minAgeOf,
  sortProducts,
} from "../src/lib/catalogue.ts";
import { buildOrderLink, buildOrderMessage, isWhatsappConfigured } from "../src/lib/whatsapp.ts";

const PRODUCTS = [
  { id: 1, name: "Stacking Rainbow", age: "1–4 years", description: "Six gentle arches", category: "Learn through play" },
  { id: 2, name: "Kiko Little Car", age: "2–5 years", description: "A little free-rolling car", category: "Move & explore" },
  { id: 3, name: "Story Blocks", age: "1–5 years", description: "A collection of simple shapes", category: "Learn through play" },
  { id: 4, name: "Morning Garden Puzzle", age: "3–6 years", description: "Softly coloured pieces", category: "Growing companions" },
];

test("minAgeOf and maxAgeOf read an age range", () => {
  assert.equal(minAgeOf("1–4 years"), 1);
  assert.equal(maxAgeOf("1–4 years"), 4);
  assert.equal(minAgeOf("3–6 years"), 3);
  assert.equal(maxAgeOf("3–6 years"), 6);
});

test("minAgeOf and maxAgeOf return null for text without digits", () => {
  assert.equal(minAgeOf("no age given"), null);
  assert.equal(maxAgeOf("no age given"), null);
});

test("age numbers keep every digit", () => {
  // \d{1,2} lama memotong "123" jadi "12"; sekarang angka penuh dibaca.
  assert.equal(minAgeOf("10–12 years"), 10);
  assert.equal(maxAgeOf("10–12 years"), 12);
  assert.equal(maxAgeOf("dari 1 sampai 123 bulan"), 123);
});

test("matchesAgeBucket filters by range", () => {
  assert.equal(matchesAgeBucket("1–4 years", "all"), true);
  assert.equal(matchesAgeBucket("1–4 years", "0-2"), true);
  assert.equal(matchesAgeBucket("3–6 years", "0-2"), false);
  assert.equal(matchesAgeBucket("2–5 years", "2-4"), true);
  assert.equal(matchesAgeBucket("2–5 years", "4-6"), true);
});

test("matchesAgeBucket never hides a product whose age is unreadable", () => {
  assert.equal(matchesAgeBucket("١–٤ سنوات", "0-2"), true);
});

test("matchesQuery searches name, description, and category", () => {
  const product = PRODUCTS[0];
  assert.equal(matchesQuery(product, ""), true);
  assert.equal(matchesQuery(product, "  "), true);
  assert.equal(matchesQuery(product, "rainbow"), true);
  assert.equal(matchesQuery(product, "RAINBOW"), true);
  assert.equal(matchesQuery(product, "arches"), true);
  assert.equal(matchesQuery(product, "learn"), true);
  assert.equal(matchesQuery(product, "car"), false);
});

test("sortProducts catalog order follows id", () => {
  const shuffled = [PRODUCTS[3], PRODUCTS[0], PRODUCTS[2], PRODUCTS[1]];
  assert.deepEqual(
    sortProducts(shuffled, "catalog").map((item) => item.id),
    [1, 2, 3, 4],
  );
});

test("sortProducts name order is alphabetical", () => {
  assert.deepEqual(
    sortProducts(PRODUCTS, "name").map((item) => item.name),
    ["Kiko Little Car", "Morning Garden Puzzle", "Stacking Rainbow", "Story Blocks"],
  );
});

test("sortProducts by youngest and oldest", () => {
  const youngest = sortProducts(PRODUCTS, "age-youngest");
  assert.equal(youngest[0].id, 1);

  const oldest = sortProducts(PRODUCTS, "age-oldest");
  assert.equal(oldest[0].id, 4);
});

test("sortProducts does not mutate the original array", () => {
  const original = PRODUCTS.map((item) => item.id);
  sortProducts(PRODUCTS, "name");
  assert.deepEqual(
    PRODUCTS.map((item) => item.id),
    original,
  );
});

test("the WhatsApp message names the product when given", () => {
  assert.equal(buildOrderMessage(), "Hello Kayu Pinoes, I would like to ask about your wooden toy collection.");
  assert.equal(
    buildOrderMessage("Story Blocks"),
    'Hello Kayu Pinoes, I would like to ask about the product "Story Blocks".',
  );
});

test("the WhatsApp message follows the site language", () => {
  assert.equal(
    buildOrderMessage("Story Blocks", "id"),
    'Halo Kayu Pinoes, saya mau bertanya tentang produk "Story Blocks".',
  );
  assert.equal(
    buildOrderMessage(undefined, "id"),
    "Halo Kayu Pinoes, saya mau bertanya tentang koleksi mainan kayunya.",
  );
  assert.ok(buildOrderMessage("Story Blocks", "ar").includes("Story Blocks"));
});

test("with no configured number, no order link is produced", () => {
  // Environment variables are not loaded outside Next.js, so this is stable.
  assert.equal(isWhatsappConfigured(), false);
  assert.equal(buildOrderLink(), null);
  assert.equal(buildOrderLink("Story Blocks"), null);
});

test("the WhatsApp message names the variant when given", () => {
  assert.equal(
    buildOrderMessage("Wooden Pine Wood", "id", "3 cm"),
    'Halo Kayu Pinoes, saya mau bertanya tentang produk "Wooden Pine Wood" (3 cm).',
  );
  assert.equal(
    buildOrderMessage("Wooden Pine Wood", "en", "3 cm"),
    'Hello Kayu Pinoes, I would like to ask about the product "Wooden Pine Wood" (3 cm).',
  );
  assert.ok(buildOrderMessage("Wooden Pine Wood", "ar", "3 cm").includes("Wooden Pine Wood"));
});

test("a variant without a product name falls back to the general message", () => {
  assert.equal(
    buildOrderMessage(undefined, "id", "3 cm"),
    "Halo Kayu Pinoes, saya mau bertanya tentang koleksi mainan kayunya.",
  );
});
