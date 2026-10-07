import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createEmptyForm,
  displayName,
  formToRecord,
  isBusyFor,
  productFormSchema,
  slugify,
  toRecord,
  validateForm,
  type ProductForm,
} from "../src/lib/product-form.ts";
import { productIllustrationLabels, productIllustrations } from "../src/lib/products.ts";
import {
  createEmptyTranslation,
  sortManagedProducts,
  type ManagedProduct,
} from "../src/lib/product-record.ts";

function baseForm(overrides: Partial<ProductForm> = {}): ProductForm {
  return {
    ...createEmptyForm([]),
    slug: "produk-uji",
    translations: {
      id: { ...createEmptyTranslation(), name: "Produk Uji" },
      en: { ...createEmptyTranslation(), name: "Test Product" },
      ar: { ...createEmptyTranslation(), name: "منتج" },
    },
    ...overrides,
  };
}

function managedProduct(documentId: string, order: number): ManagedProduct {
  return {
    documentId,
    id: Number(documentId),
    surface: "#F9E2BE",
    accent: "#D88653",
    illustration: "rainbow",
    status: "published",
    order,
    translations: {
      id: { ...createEmptyTranslation(), name: `Produk ${documentId}` },
      en: { ...createEmptyTranslation(), name: `Product ${documentId}` },
      ar: { ...createEmptyTranslation(), name: `منتج ${documentId}` },
    },
  };
}

test("createEmptyTranslation menghasilkan sembilan field kosong", () => {
  const translation = createEmptyTranslation();
  assert.equal(Object.keys(translation).length, 9);
  assert.deepEqual(Object.values(translation), Array(9).fill(""));
});

test("validateForm menerima formulir yang lengkap", () => {
  assert.deepEqual(validateForm(baseForm({ id: "7", order: "3" })), []);
});

test("validateForm menolak ID yang sudah dipakai saat menambah produk", () => {
  const errors = validateForm(baseForm({ id: "1" }), {
    isEditing: false,
    existingDocumentIds: ["1", "2"],
  });

  assert.equal(errors.length, 1);
  assert.match(errors[0], /sudah dipakai/);
});

test("validateForm tidak menolak ID sendiri saat mengedit", () => {
  const errors = validateForm(baseForm({ id: "1" }), {
    isEditing: true,
    existingDocumentIds: ["1", "2"],
  });

  assert.deepEqual(errors, []);
});

test("validateForm menolak warna dan nama yang tidak sah", () => {
  const errors = validateForm(
    baseForm({
      surface: "merah",
      accent: "#GGGGGG",
      translations: {
        id: { ...createEmptyTranslation(), name: "  " },
        en: { ...createEmptyTranslation(), name: "Test" },
        ar: { ...createEmptyTranslation(), name: "منتج" },
      },
    }),
  );

  assert.equal(errors.length, 3);
  assert.ok(errors.some((error) => error.includes("Warna latar")));
  assert.ok(errors.some((error) => error.includes("Warna aksen")));
  assert.ok(errors.some((error) => error.includes("bahasa ID")));
});


test("setiap jenis ilustrasi punya label di panel admin", () => {
  for (const illustration of productIllustrations) {
    const label = productIllustrationLabels[illustration];
    assert.equal(typeof label, "string", `label ${illustration} bukan teks`);
    assert.ok(label.trim().length > 0, `label ${illustration} kosong`);
  }
});

test("slugify mengubah nama menjadi alamat", () => {
  assert.equal(slugify("Pelangi Susun"), "pelangi-susun");
  assert.equal(slugify("Mobil Kecil Kiko!"), "mobil-kecil-kiko");
  assert.equal(slugify("  Puzzle  Kebun   Pagi  "), "puzzle-kebun-pagi");
  assert.equal(slugify("Kuda & Bebek"), "kuda-bebek");
  assert.equal(slugify("Café Déjà"), "cafe-deja");
  assert.equal(slugify(""), "");
});

test("validateForm menolak alamat kosong atau tidak wajar", () => {
  assert.ok(validateForm(baseForm({ slug: "" })).some((error) => error.includes("wajib diisi")));
  assert.ok(validateForm(baseForm({ slug: "Ada Spasi" })).length > 0);
  assert.ok(validateForm(baseForm({ slug: "huruf-BESAR" })).length > 0);
  assert.ok(validateForm(baseForm({ slug: "ganda--hubung" })).length > 0);
  assert.ok(validateForm(baseForm({ slug: "-awalan" })).length > 0);
});

test("validateForm menolak alamat yang sudah dipakai produk lain", () => {
  const errors = validateForm(baseForm({ slug: "story-blocks" }), {
    otherSlugs: ["story-blocks", "number-tower"],
  });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /sudah dipakai/);

  assert.deepEqual(validateForm(baseForm({ slug: "produk-baru" }), { otherSlugs: ["story-blocks"] }), []);
});

test("formToRecord menyertakan alamat halaman", () => {
  const record = formToRecord(baseForm({ slug: " produk-baru " }));
  assert.equal(record.slug, "produk-baru");
});

test("createEmptyForm memulai dengan alamat kosong", () => {
  assert.equal(createEmptyForm([]).slug, "");
});
test("isBusyFor tidak tertukar antara documentId 1 dan 11", () => {
  assert.equal(isBusyFor("status:11", "11"), true);
  assert.equal(isBusyFor("status:11", "1"), false);
  assert.equal(isBusyFor("move:1", "1"), true);
  assert.equal(isBusyFor("delete:2", "22"), false);
  assert.equal(isBusyFor(null, "1"), false);
});

test("formToRecord memangkas spasi dan mengubah angka", () => {
  const record = formToRecord(
    baseForm({ id: " 5 ", order: " 2 ", surface: "#F9E2BE ", accent: " #D88653" }),
  );

  assert.equal(record.id, 5);
  assert.equal(record.order, 2);
  assert.equal(record.surface, "#F9E2BE");
  assert.equal(record.accent, "#D88653");
  assert.equal(record.imageUrl, undefined);
});

test("formToRecord menyertakan foto hanya bila diisi", () => {
  const record = formToRecord(baseForm({ imageUrl: " /images/a.png ", imagePath: "" }));
  assert.equal(record.imageUrl, "/images/a.png");
  assert.equal(record.imagePath, undefined);
});

test("toRecord membuang documentId", () => {
  const record = toRecord(managedProduct("3", 9));
  assert.equal(record.id, 3);
  assert.equal("documentId" in record, false);
});

test("createEmptyForm menyarankan ID dan urutan berikutnya", () => {
  const form = createEmptyForm([managedProduct("1", 1), managedProduct("4", 8)]);
  assert.equal(form.id, "5");
  assert.equal(form.order, "9");
  assert.equal(form.status, "draft");
});

test("displayName jatuh ke documentId bila nama kosong", () => {
  const product = managedProduct("6", 1);
  product.translations.id = { ...createEmptyTranslation(), name: "   " };
  assert.equal(displayName(product), "6");
});

/**
 * Skema Zod adalah sumber aturan bentuk yang dipakai UI (pesan per kolom)
 * MAUPUN validateForm. Yang diuji langsung di sini adalah hal yang tidak
 * terlihat dari daftar pesan validateForm: letak galat per field.
 */
test("productFormSchema menandai field yang salah lewat path-nya", () => {
  const result = productFormSchema().safeParse(
    baseForm({ id: "0", slug: "Ada Spasi", surface: "merah" }),
  );

  assert.equal(result.success, false);
  if (result.success) return;

  const paths = result.error.issues.map((issue) => issue.path.join(".")).sort();
  assert.deepEqual(paths, ["id", "slug", "surface"]);
});

test("productFormSchema menolak kunci ilustrasi yang tidak dikenal", () => {
  const form = baseForm();
  (form as { illustration: string }).illustration = "pesawat";

  const result = productFormSchema().safeParse(form);
  assert.equal(result.success, false);
});

test("productFormSchema menerima setiap ilustrasi yang terdaftar", () => {
  for (const illustration of productIllustrations) {
    const result = productFormSchema().safeParse({
      ...baseForm(),
      illustration,
    });
    assert.equal(result.success, true, `ilustrasi ${illustration} harusnya sah`);
  }
});

test("validateForm tetap mengembalikan pesan dalam urutan field", () => {
  const errors = validateForm(baseForm({ translations: {
    id: createEmptyTranslation(),
    en: createEmptyTranslation(),
    ar: createEmptyTranslation(),
  } }));

  // Tiga nama kosong + tidak ada yang lain.
  assert.equal(errors.length, 3);
  assert.ok(errors.every((error) => error.includes("wajib diisi")));
});

test("sortManagedProducts mengurutkan berdasarkan order lalu id", () => {
  const sorted = sortManagedProducts([
    managedProduct("3", 2),
    managedProduct("2", 2),
    managedProduct("1", 1),
  ]);

  assert.deepEqual(
    sorted.map((product) => product.documentId),
    ["1", "2", "3"],
  );
});

test("formToRecord menyertakan varian dan merapikan spasinya", () => {
  const record = formToRecord(
    baseForm({
      variants: [
        { label: " 3 cm ", price: " $4 / 10 pcs " },
        { label: "5 cm", price: "" },
      ],
    }),
  );

  assert.deepEqual(record.variants, [
    { label: "3 cm", price: "$4 / 10 pcs" },
    { label: "5 cm", price: "" },
  ]);
});

test("formToRecord tidak menulis varian bila tidak ada", () => {
  assert.equal(formToRecord(baseForm()).variants, undefined);
});

test("validateForm menolak varian tanpa nama", () => {
  const errors = validateForm(baseForm({ variants: [{ label: "  ", price: "$4" }] }));
  assert.equal(errors.length, 1);
  assert.match(errors[0], /Varian baris 1/);
});

test("createEmptyForm memulai tanpa varian", () => {
  assert.deepEqual(createEmptyForm([]).variants, []);
});
