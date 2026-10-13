import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildGalleryPath,
  isGalleryImageName,
  sortGalleryNames,
} from "../src/lib/gallery-model.ts";

test("buildGalleryPath membentuk nama ramah dengan stempel waktu di depan", () => {
  assert.equal(
    buildGalleryPath("Proses Kayu Jati.JPG", 1791750000000),
    "gallery/1791750000000-proses-kayu-jati.jpg",
  );
});

test("buildGalleryPath memberi ekstensi jpg bila berkas tanpa ekstensi", () => {
  assert.equal(buildGalleryPath("foto", 1000), "gallery/1000-foto.jpg");
});

test("buildGalleryPath memakai 'foto' bila nama tidak menyisakan huruf/angka", () => {
  assert.equal(buildGalleryPath("###.png", 2000), "gallery/2000-foto.png");
});

test("buildGalleryPath memotong nama yang kepanjangan", () => {
  const path = buildGalleryPath("a".repeat(120) + ".webp", 3000);
  assert.equal(path, "gallery/3000-" + "a".repeat(40) + ".webp");
});

test("isGalleryImageName menerima gambar dan menolak sisanya", () => {
  assert.equal(isGalleryImageName("1791750000000-proses.webp"), true);
  assert.equal(isGalleryImageName("FOTO.PNG"), true);
  assert.equal(isGalleryImageName(".emptyFolderPlaceholder"), false);
  assert.equal(isGalleryImageName("catatan.txt"), false);
  assert.equal(isGalleryImageName(""), false);
});

test("sortGalleryNames mengurutkan terbaru dulu", () => {
  assert.deepEqual(
    sortGalleryNames(["100-a.jpg", "200-b.jpg", "150-c.jpg"]),
    ["200-b.jpg", "150-c.jpg", "100-a.jpg"],
  );
});
