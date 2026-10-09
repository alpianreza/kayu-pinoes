import assert from "node:assert/strict";
import { test } from "node:test";

import { isLocalImageSource } from "../src/lib/products.ts";

/**
 * Batas antara gambar lokal dan gambar luar.
 *
 * Salah menilai sumber berarti salah memilih jalur render: URL luar yang
 * dianggap lokal akan diberikan ke next/image dan melempar galat karena
 * host-nya tidak ada di `remotePatterns`.
 */
test("isLocalImageSource recognises project files", () => {
  assert.equal(isLocalImageSource("/images/products/pelangi-susun.jpeg"), true);
  assert.equal(isLocalImageSource("/logo.png"), true);
});

test("isLocalImageSource treats every other form as external", () => {
  assert.equal(isLocalImageSource("https://aoawbhhnpndntqziefjv.supabase.co/storage/v1/object/public/produk/x.png"), false);
  assert.equal(isLocalImageSource("http://example.com/foto.jpg"), false);
  // Alamat protokol-relatif dan path relatif juga bukan berkas proyek.
  assert.equal(isLocalImageSource("//cdn.example.com/foto.jpg"), false);
  assert.equal(isLocalImageSource("images/foto.jpg"), false);
  assert.equal(isLocalImageSource(""), false);
});