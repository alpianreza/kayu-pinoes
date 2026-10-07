import assert from "node:assert/strict";
import { test } from "node:test";

import { formatAgeRange, toArabicDigits } from "../src/lib/age-display.ts";

test("rentang tahun utuh dibentuk persis seperti data lama (Indonesia)", () => {
  assert.equal(formatAgeRange(12, 48, "id"), "1–4 tahun");
  assert.equal(formatAgeRange(12, 36, "id"), "1–3 tahun");
  assert.equal(formatAgeRange(24, 60, "id"), "2–5 tahun");
  assert.equal(formatAgeRange(12, 60, "id"), "1–5 tahun");
  assert.equal(formatAgeRange(36, 72, "id"), "3–6 tahun");
});

test("rentang tahun utuh dalam bahasa Inggris", () => {
  assert.equal(formatAgeRange(12, 48, "en"), "1–4 years");
  assert.equal(formatAgeRange(36, 72, "en"), "3–6 years");
});

test("angka Arab memakai digit Arab-Indic", () => {
  assert.equal(formatAgeRange(12, 48, "ar"), "١–٤ سنوات");
  assert.equal(formatAgeRange(36, 72, "ar"), "٣–٦ سنوات");
});

test("tidak bulat tahun: tampil dalam bulan", () => {
  assert.equal(formatAgeRange(6, 18, "id"), "6–18 bulan");
  assert.equal(formatAgeRange(6, 18, "en"), "6–18 months");
  assert.equal(formatAgeRange(6, 18, "ar"), "٦–١٨ أشهر");
  assert.equal(formatAgeRange(9, 9, "id"), "9 bulan");
});

test("urutan terbalik tetap dinormalkan", () => {
  assert.equal(formatAgeRange(48, 12, "id"), "1–4 tahun");
});

test("toArabicDigits hanya mengubah angka Latin", () => {
  assert.equal(toArabicDigits("1–4"), "١–٤");
  assert.equal(toArabicDigits("abc 10"), "abc ١٠");
  assert.equal(toArabicDigits("tanpa angka"), "tanpa angka");
});
