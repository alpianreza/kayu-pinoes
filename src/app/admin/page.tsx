"use client";

import Link from "next/link";
import { ArrowLeft, LogOut, Plus } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";

import { Button } from "@/components/ui/button";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { staticProductSlug } from "@/lib/products";
import type { ProductRecord } from "@/lib/product-record";
import {
  deleteProductImage,
  deleteProductRecord,
  productDocumentExists,
  productDocumentId,
  saveProductRecord,
  swapProductOrder,
  uploadProductImage,
} from "@/lib/firebase-product-admin";
import {
  getPublishedFirebaseProducts,
  subscribeToManagedProducts,
  type ManagedProduct,
  type ProductStatus,
} from "@/lib/firebase-products";
import {
  createEmptyForm,
  formFromProduct,
  sortByOrderForDisplay,
  toMessage,
  toRecord,
  validateForm,
  type ProductForm,
} from "@/lib/product-form";

import { AdminLogin } from "./_components/AdminLogin";
import { Notice } from "./_components/Notice";
import { NotConfiguredScreen } from "./_components/NotConfiguredScreen";
import { ProductEditor } from "./_components/ProductEditor";
import { ProductList } from "./_components/ProductList";

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").trim().toLowerCase();

type PublicCatalogStatus =
  | { state: "checking" }
  | { state: "firestore"; count: number }
  | { state: "static"; detail: string | null };

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [managedProducts, setManagedProducts] = useState<ManagedProduct[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [publicCatalog, setPublicCatalog] = useState<PublicCatalogStatus>({ state: "checking" });

  const [editorOpen, setEditorOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  // Tombol yang membuka editor, supaya fokus bisa dikembalikan ke sana saat
  // editor ditutup - tanpa ini fokus jatuh ke <body> dan pengguna keyboard
  // kehilangan posisinya.
  const editorTriggerRef = useRef<HTMLElement | null>(null);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  // Nilai AWAL formulir saja; isian selama diketik dipegang react-hook-form
  // di dalam ProductEditor. Panel di-mount ulang lewat `editorSession` setiap
  // kali dibuka, jadi tidak ada sisa nilai dari produk sebelumnya.
  const [editorInitialForm, setEditorInitialForm] = useState<ProductForm>(() => createEmptyForm([]));
  const [editorSession, setEditorSession] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Jejak berkas gambar selama satu sesi buka-tutup editor, supaya tidak ada
  // berkas yang tertinggal di Storage. Dipakai sebagai ref (bukan state)
  // karena hanya dibaca saat menutup editor - tidak ada UI yang ikut berubah:
  //   - sessionUploadsRef : berkas yang DIUNGGAH sesi ini. Belum pernah dibaca
  //     dokumen mana pun sampai simpan sukses, jadi yang tidak terpilih selalu
  //     aman dibuang saat sesi berakhir.
  //   - attachedImageRef  : path gambar milik dokumen saat editor dibuka.
  //     Baru dihapus setelah simpan sukses DAN benar-benar tergantikan; kalau
  //     sesi dibatalkan, dokumen masih menunjuk ke sana.
  const sessionUploadsRef = useRef<string[]>([]);
  const attachedImageRef = useRef<string | null>(null);
  // Diisi handleSave saat simpan sukses: gambar yang kini dipakai dokumen
  // (null bila foto dikosongkan). `undefined` = sesi ditutup TANPA menyimpan.
  // Efek penutupan editor membacanya untuk memutuskan berkas mana yang dibuang.
  const savedImageRef = useRef<string | null | undefined>(undefined);
  const editorWasOpenRef = useRef(false);

  const isAdmin =
    Boolean(user) &&
    ADMIN_EMAIL.length > 0 &&
    (user?.email ?? "").trim().toLowerCase() === ADMIN_EMAIL;

  useEffect(() => {
    // Bila Firebase belum dikonfigurasi, `authReady` sudah bernilai true sejak
    // inisialisasi state, jadi tidak ada yang perlu dilakukan di sini.
    if (!isFirebaseConfigured || !firebaseAuth) return;

    const auth = firebaseAuth;

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    return subscribeToManagedProducts(
      (nextProducts) => {
        setManagedProducts(nextProducts);
        setProductsLoaded(true);
        setListError(null);
      },
      (error) => {
        setListError(toMessage(error));
        setProductsLoaded(true);
      },
    );
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    // Pemeriksaan sekali jalan: apakah halaman publik benar-benar memakai
    // Firestore, atau diam-diam jatuh ke katalog statis?
    let active = true;

    getPublishedFirebaseProducts("id")
      .then((items) => {
        if (!active) return;
        setPublicCatalog(
          items.length > 0
            ? { state: "firestore", count: items.length }
            : {
                state: "static",
                detail:
                  "Belum ada produk yang tampil, jadi situs masih memakai contoh bawaan.",
              },
        );
      })
      .catch(() => {
        if (!active) return;
        // Penyebabnya sama dengan galat baca koleksi yang sudah tampil di
        // bawah. Jangan tampilkan pesan panjang yang sama dua kali.
        setPublicCatalog({
          state: "static",
          detail: "Belum bisa diperiksa — lihat pesan merah di bawah.",
        });
      });

    return () => {
      active = false;
    };
  }, [isAdmin]);

  const orderedProducts = useMemo(() => sortByOrderForDisplay(managedProducts), [managedProducts]);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firebaseAuth) return;

    setSigningIn(true);
    setAuthError(null);

    try {
      await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      setPassword("");
    } catch (error) {
      setAuthError(toMessage(error));
    } finally {
      setSigningIn(false);
    }
  }

  async function handleSignOut() {
    if (!firebaseAuth) return;

    // Editor ikut ditutup lewat jalur biasa, jadi beres-beres berkas dan
    // pemulihan fokus ditangani efek penutupan editor.
    closeEditor();
    setNotice(null);
    await signOut(firebaseAuth);
  }

  // Options validasi dihitung ulang setiap snapshot produk berubah, supaya
  // editor selalu memeriksa terhadap isi koleksi terbaru (dipakai skema Zod
  // di dalam ProductEditor maupun pemeriksaan terakhir di handleSave).
  const validationOptions = useMemo(
    () => ({
      isEditing: editingDocumentId !== null,
      existingDocumentIds: managedProducts.map((product) => product.documentId),
      // Alamat milik produk LAIN - termasuk yang masih diturunkan dari katalog
      // bawaan, supaya dua produk tidak pernah punya alamat yang sama.
      otherSlugs: managedProducts
        .filter((product) => product.documentId !== editingDocumentId)
        .map((product) => product.slug ?? staticProductSlug(product.id) ?? String(product.id)),
    }),
    [editingDocumentId, managedProducts],
  );

  function startCreate() {
    rememberEditorTrigger();
    setEditorInitialForm(createEmptyForm(managedProducts));
    setEditingDocumentId(null);
    setFormError(null);
    setEditorSession((current) => current + 1);
    sessionUploadsRef.current = [];
    attachedImageRef.current = null;
    savedImageRef.current = undefined;
    setEditorOpen(true);
  }

  function startEdit(product: ManagedProduct) {
    rememberEditorTrigger();
    setEditorInitialForm(formFromProduct(product));
    setEditingDocumentId(product.documentId);
    setFormError(null);
    setEditorSession((current) => current + 1);
    sessionUploadsRef.current = [];
    attachedImageRef.current = product.imagePath ?? null;
    savedImageRef.current = undefined;
    setEditorOpen(true);
  }

  // Editor tampil sebagai modal, jadi halaman di belakangnya dikunci supaya
  // tidak ikut tergulir.
  useEffect(() => {
    if (!editorOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [editorOpen]);

  // Esc menutup editor, sama seperti tombol Batal.
  useEffect(() => {
    if (!editorOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setEditorOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editorOpen]);

  /** Simpan elemen yang membuka editor agar fokus bisa dikembalikan ke sana. */
  function rememberEditorTrigger() {
    editorTriggerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }

  /**
   * Beres-beres saat editor ditutup, apa pun jalurnya (Batal, X, Esc, simpan).
   *
   * Dijalankan sebagai efek, bukan di dalam penangan tombol, supaya tidak
   * bergantung pada satu jalur tertentu: setiap kali `editorOpen` berubah dari
   * terbuka ke tertutup, berkas yang tidak dipakai lagi dibuang dan fokus
   * dikembalikan ke tombol asal.
   */
  useEffect(() => {
    if (editorOpen) {
      editorWasOpenRef.current = true;
      // Pindahkan fokus ke dalam dialog. Panel-nya punya tabIndex={-1} supaya
      // bisa difokuskan; judul panel diumumkan lewat aria-labelledby.
      editorRef.current?.focus();
      return;
    }

    if (!editorWasOpenRef.current) return;
    editorWasOpenRef.current = false;

    // Unggahan sesi ini yang tidak terpilih selalu jadi yatim di sini: belum
    // sempat dibaca dokumen mana pun kalau sesi dibatalkan, atau sudah tidak
    // dipakai lagi kalau sesi disimpan.
    const kept = savedImageRef.current ?? null;
    for (const path of sessionUploadsRef.current) {
      if (path !== kept) void deleteProductImage(path);
    }
    sessionUploadsRef.current = [];

    // Gambar lama dokumen hanya dihapus kalau simpan sukses DAN dokumen sudah
    // benar-benar beralih ke gambar lain. Kalau sesi dibatalkan, nilai ini
    // masih `undefined` dan gambar lama tetap dipakai dokumen.
    if (savedImageRef.current !== undefined) {
      const attached = attachedImageRef.current;
      if (attached && attached !== savedImageRef.current) void deleteProductImage(attached);
      attachedImageRef.current = null;
      savedImageRef.current = undefined;
    }

    editorTriggerRef.current?.focus();
    editorTriggerRef.current = null;
  }, [editorOpen]);

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
    setEditingDocumentId(null);
    setFormError(null);
  }, []);

  /**
   * Simpan hasil formulir.
   *
   * ProductEditor sudah memvalidasi lewat skema Zod yang sama (pesan per
   * kolom); pemeriksaan di sini adalah penjaga terakhir - murah dan menjamin
   * tidak ada jalur lain (mis. submit keyboard saat React belum selesai
   * me-resolver) yang mengirim record cacat ke Firestore.
   */
  async function handleSave(record: ProductRecord) {
    // Bentuk ulang record menjadi versi formulir agar bisa diperiksa dengan
    // skema yang sama - penjaga terakhir sebelum menulis ke Firestore.
    const formForCheck: ProductForm = {
      id: String(record.id),
      slug: record.slug ?? "",
      order: String(record.order),
      status: record.status,
      surface: record.surface,
      accent: record.accent,
      illustration: record.illustration,
      imageUrl: record.imageUrl ?? "",
      imagePath: record.imagePath ?? "",
      variants: (record.variants ?? []).map((variant) => ({ label: variant.label, price: variant.price })),
      translations: record.translations,
    };
    const errors = validateForm(formForCheck, validationOptions);

    if (errors.length > 0) {
      setFormError(errors.join(" "));
      return;
    }

    setSaving(true);
    setFormError(null);
    setNotice(null);

    try {
      // Menyimpan hasil edit memakai setDoc(merge: false) yang MENIMPA seluruh
      // dokumen - dan membuat dokumen baru kalau ternyata sudah dihapus dari
      // perangkat lain. Diperiksa dulu supaya produk yang sudah dihapus tidak
      // hidup lagi dari form yang tertinggal terbuka di layar ini.
      const documentId = productDocumentId(record.id);
      if (editingDocumentId !== null && !(await productDocumentExists(documentId))) {
        setFormError(
          `Produk #${record.id} sudah dihapus (mungkin dari perangkat lain), jadi tidak bisa disimpan sebagai hasil edit. ` +
            "Tutup formulir ini, lalu buat ulang lewat \"Tambah produk\" kalau memang masih dibutuhkan.",
        );
        return;
      }

      await saveProductRecord(record);

      // Beritahu efek penutupan bahwa sesi berakhir dengan simpan sukses,
      // dan gambar mana yang kini dipakai dokumen. Efek itulah yang membuang
      // berkas yatim dan gambar lama yang tergantikan.
      savedImageRef.current = record.imagePath ?? null;

      setNotice(`Produk "${record.translations.id.name}" berhasil disimpan.`);
      closeEditor();
    } catch (error) {
      setFormError(toMessage(error));
    } finally {
      setSaving(false);
    }
  }

  /** Unggah berkas; pemanggil (ProductEditor) yang menyimpan hasilnya ke form. */
  async function handleUpload(
    idValue: string,
    file: File,
  ): Promise<{ imageUrl: string; imagePath: string }> {
    // Document ID diturunkan dari ID produk, termasuk untuk produk baru.
    // Kalau kolom ID belum diisi (mis. sempat dikosongkan admin), pakai nama
    // cadangan supaya unggahan tetap berjalan dan produk tetap bisa dibuat.
    const numericId = Number(idValue.trim());
    const documentId =
      Number.isInteger(numericId) && numericId >= 1 ? productDocumentId(numericId) : "produk-baru";
    const uploaded = await uploadProductImage(documentId, file);
    sessionUploadsRef.current = [...sessionUploadsRef.current, uploaded.imagePath];
    return uploaded;
  }

  async function toggleStatus(product: ManagedProduct) {
    const nextStatus: ProductStatus = product.status === "published" ? "draft" : "published";

    setBusyAction(`status:${product.documentId}`);
    setListError(null);
    setNotice(null);

    try {
      await saveProductRecord({ ...toRecord(product), status: nextStatus });
      setNotice(
        `"${product.translations.id?.name ?? product.documentId}" sekarang ${
          nextStatus === "published" ? "tampil di situs" : "disembunyikan dari pembeli"
        }.`,
      );
    } catch (error) {
      setListError(toMessage(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function moveProduct(product: ManagedProduct, direction: -1 | 1) {
    const index = orderedProducts.findIndex((item) => item.documentId === product.documentId);
    const targetIndex = index + direction;

    if (index < 0 || targetIndex < 0 || targetIndex >= orderedProducts.length) return;

    setBusyAction(`move:${product.documentId}`);
    setListError(null);
    setNotice(null);

    try {
      await swapProductOrder(orderedProducts[index], orderedProducts[targetIndex]);
      setNotice("Urutan produk diperbarui.");
    } catch (error) {
      setListError(toMessage(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function removeProduct(product: ManagedProduct) {
    const label = product.translations.id?.name ?? product.documentId;

    if (!window.confirm(`Yakin hapus "${label}"? Setelah dihapus, produk tidak bisa kembali.`)) {
      return;
    }

    setBusyAction(`delete:${product.documentId}`);
    setListError(null);
    setNotice(null);

    try {
      await deleteProductRecord(product.documentId);
      setNotice(`Produk "${label}" dihapus.`);
    } catch (error) {
      setListError(toMessage(error));
    } finally {
      setBusyAction(null);
    }
  }


  return (
    <div className="min-h-dvh bg-[#FBF9F3] text-[#27372D]">
      <header className="border-b border-[#314B3A]/10 bg-[#FBF9F3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="grid size-9 place-items-center rounded-full bg-[#D98B64] text-sm font-black text-white"
              aria-label="Kembali ke beranda Kayu Pinoes"
            >
              K
            </Link>
            <div>
              <p className="font-display text-xl leading-none tracking-[-0.05em] text-[#314B3A]">Kayu Pinoes</p>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#C76845]">Panel admin</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? <span className="hidden text-xs font-bold text-[#6B766E] sm:inline">{user.email}</span> : null}
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft size={15} /> Lihat situs
              </Link>
            </Button>
            {user ? (
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut size={15} /> Keluar
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      {!isFirebaseConfigured ? <NotConfiguredScreen /> : null}

      {isFirebaseConfigured && !authReady ? (
        <p className="mx-auto max-w-3xl px-5 py-16 text-center text-sm font-bold text-[#6B766E] sm:px-8">
          Memeriksa status login…
        </p>
      ) : null}

      {isFirebaseConfigured && authReady && !user ? (
        <AdminLogin
          email={email}
          password={password}
          error={authError}
          signingIn={signingIn}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSignIn}
        />
      ) : null}

      {isFirebaseConfigured && user && !isAdmin ? (
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
          <div className="rounded-[2rem] border border-[#C76845]/25 bg-[#F9E7DF] p-7 sm:p-9">
            <h1 className="font-display text-3xl tracking-[-0.05em] text-[#8A3F23]">Akun ini bukan admin</h1>
            <p className="mt-4 leading-7 text-[#8A3F23]">
              Kamu masuk sebagai <strong>{user.email}</strong>, tetapi panel ini hanya untuk admin.
            </p>
            <p className="mt-3 text-sm leading-6 text-[#8A3F23]">
              {ADMIN_EMAIL.length === 0
                ? "Email admin belum diisi di berkas .env.local, jadi tidak ada akun yang diakui sebagai admin. Isi nilainya, jalankan ulang server, lalu masuk lagi."
                : `Email admin yang diakui: ${ADMIN_EMAIL}. Pastikan sama persis dengan yang tertulis di berkas firestore.rules dan storage.rules.`}
            </p>
            <Button className="mt-6" variant="outline" onClick={handleSignOut}>
              <LogOut size={16} /> Keluar
            </Button>
          </div>
        </div>
      ) : null}

      {isAdmin ? (
        <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#C76845]">
                Katalog online
              </p>
              <h1 className="font-display text-4xl tracking-[-0.055em] text-[#294332]">Kelola produk</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#6B766E]">
                Perubahan langsung terlihat di situs untuk produk berstatus <strong>Tampil di situs</strong>.
                Produk berstatus <strong>Disimpan saja</strong> belum dilihat pembeli.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={startCreate}>
                <Plus size={16} /> Tambah produk
              </Button>
            </div>
          </div>

          <p className="mt-6 rounded-2xl border border-[#314B3A]/12 bg-white px-4 py-3 text-xs font-semibold text-[#536459]">
            Yang dilihat pembeli:{" "}
            {publicCatalog.state === "checking" ? (
              <span className="text-[#8A948C]">memeriksa…</span>
            ) : publicCatalog.state === "firestore" ? (
              <span className="text-[#2F5236]">
                situs sedang menampilkan {publicCatalog.count} produk
              </span>
            ) : (
              <span className="text-[#8A3F23]">belum ada yang tampil — situs masih pakai contoh bawaan</span>
            )}
            {publicCatalog.state === "static" && publicCatalog.detail ? (
              <span className="mt-1 block font-medium text-[#8A948C]">{publicCatalog.detail}</span>
            ) : null}
          </p>

          <div className="mt-5 grid gap-3">
            {listError ? <Notice kind="error">{listError}</Notice> : null}
            {notice ? <Notice kind="success">{notice}</Notice> : null}
          </div>

          {editorOpen ? (
            <div className="kp-modal-backdrop fixed inset-0 z-50 overflow-y-auto bg-[#1B241E]/55 backdrop-blur-[2px]">
              <div className="flex min-h-full items-start justify-center p-4 sm:p-6 lg:p-8">
                <div
                  ref={editorRef}
                  className="kp-modal-panel w-full max-w-5xl outline-none"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="product-editor-title"
                  tabIndex={-1}
                >
                  {/*
                    key = nomor sesi: panel editor di-mount ulang setiap dibuka
                    supaya react-hook-form memulai dari nilai awal yang baru
                    dan tidak pernah mewarisi isian produk sebelumnya.
                    Bersih-bersih berkas unggahan tetap dikoordinasi di sini:
                    unggahan sesi ini dibuang saat editor ditutup tanpa
                    menyimpan, dan gambar lama dokumen baru dihapus setelah
                    dokumennya benar-benar beralih.
                  */}
                  <ProductEditor
                    key={editorSession}
                    initialForm={editorInitialForm}
                    validationOptions={validationOptions}
                    editingDocumentId={editingDocumentId}
                    saving={saving}
                    serverError={formError}
                    onUpload={handleUpload}
                    onClose={closeEditor}
                    onSubmit={handleSave}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <ProductList
            products={orderedProducts}
            productsLoaded={productsLoaded}
            loadFailed={listError !== null}
            busyAction={busyAction}
            onMove={moveProduct}
            onToggleStatus={toggleStatus}
            onEdit={startEdit}
            onRemove={removeProduct}
          />
        </main>
      ) : null}
    </div>
  );
}