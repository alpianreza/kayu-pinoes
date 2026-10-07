import assert from "node:assert/strict";
import { test } from "node:test";

import { DEFAULT_LANGUAGE, normalizeLanguage, parseLanguage } from "../src/lib/i18n.ts";
import { languageAlternates, languageDirections, languageMetadata } from "../src/lib/locale-metadata.ts";

test("parseLanguage accepts only the languages the site knows", () => {
  assert.equal(parseLanguage("id"), "id");
  assert.equal(parseLanguage("en"), "en");
  assert.equal(parseLanguage("ar"), "ar");
  assert.equal(parseLanguage("de"), null);
  assert.equal(parseLanguage(""), null);
  assert.equal(parseLanguage(null), null);
  assert.equal(parseLanguage(undefined), null);
});

test("normalizeLanguage falls back to the site default", () => {
  assert.equal(normalizeLanguage("ar"), "ar");
  assert.equal(normalizeLanguage("xx"), DEFAULT_LANGUAGE);
  assert.equal(normalizeLanguage(null), DEFAULT_LANGUAGE);
});

test("only Arabic reads right-to-left", () => {
  assert.equal(languageDirections("ar"), "rtl");
  assert.equal(languageDirections("id"), "ltr");
  assert.equal(languageDirections("en"), "ltr");
});

/**
 * Hreflang menjanjikan sesuatu yang harus ditepati: setiap bahasa harus benar-
 * benar bisa disajikan di alamat yang ditunjuk. Halaman membaca `?lang=`,
 * jadi alternates harus memakai parameter itu.
 */
test("languageAlternates points every language at a lang parameter", () => {
  assert.deepEqual(languageAlternates("/about"), {
    id: "/about?lang=id",
    en: "/about?lang=en",
    ar: "/about?lang=ar",
  });
});

test("languageAlternates does not double up the query separator", () => {
  assert.deepEqual(languageAlternates("/products/number-tower?src=sitemap"), {
    id: "/products/number-tower?src=sitemap&lang=id",
    en: "/products/number-tower?src=sitemap&lang=en",
    ar: "/products/number-tower?src=sitemap&lang=ar",
  });
});

test("every language has a metadata entry usable for hreflang and og:locale", () => {
  assert.deepEqual(Object.keys(languageMetadata).sort(), ["ar", "en", "id"]);
  for (const [code, meta] of Object.entries(languageMetadata)) {
    assert.equal(meta.hreflang, code, `hreflang for ${code} should equal its code`);
    assert.match(meta.ogLocale, /^[a-z]{2,3}_[A-Z]{2}$/);
  }
});