import type { Language } from "./catalog-i18n.ts";

/**
 * Teks antarmuka untuk seluruh situs (header, katalog, detail, tentang, kontak,
 * footer) dalam tiga bahasa. Teks PRODUK tidak ada di sini - itu hidup di
 * catalog-i18n.ts sebagai satu-satunya sumber.
 */
export type SiteCopy = {
  header: {
    home: string;
    catalog: string;
    about: string;
    contact: string;
    languageControl: string;
    openMenu: string;
    closeMenu: string;
    skipToContent: string;
  };
  catalog: {
    eyebrow: string;
    title: string;
    intro: string;
    searchLabel: string;
    searchPlaceholder: string;
    categoryLabel: string;
    allCategories: string;
    sortLabel: string;
    sortCatalog: string;
    sortName: string;
    sortYoungest: string;
    sortOldest: string;
    ageLabel: string;
    ageAll: string;
    ageYears: string;
    showing: (visible: number, total: number) => string;
    clearFilters: string;
    emptyTitle: string;
    emptyBody: string;
    orderEyebrow: string;
    orderTitle: string;
    orderBody: string;
  };
  detail: {
    home: string;
    catalog: string;
    notFoundEyebrow: string;
    notFoundTitle: string;
    notFoundBody: string;
    notFoundCta: string;
    backToCatalog: string;
    moreEyebrow: string;
    moreTitle: string;
    allProducts: string;
    viewDetails: string;
    /** Judul daftar varian, mis. "Varian". */
    variantsTitle: string;
    /** Ditampilkan bila sebuah varian belum ada harganya. */
    askPrice: string;
    /** Keterangan kecil di bawah daftar varian. */
    variantsHint: string;
    /** Judul baris harga di samping varian, mis. "Harga". */
    priceLabel: string;
    /** Baris harga sebelum varian dipilih, mis. "Mulai dari". */
    priceFrom: string;
    specs: {
      age: string;
      wood: string;
      dimensions: string;
      finish: string;
      contents: string;
      care: string;
    };
  };
  about: {
    eyebrow: string;
    title: string;
    intro: string;
    processEyebrow: string;
    processTitle: string;
    process: Array<{ title: string; copy: string }>;
    values: Array<{ title: string; copy: string }>;
    ctaEyebrow: string;
    /** Menerima jumlah produk yang sedang tampil di katalog. */
    ctaTitle: (productCount: number) => string;
    ctaButton: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    intro: string;
    steps: Array<{ title: string; copy: string }>;
    asideTitle: string;
    configuredBody: string;
    destination: string;
    beforeTitle: string;
    before: string[];
    ctaEyebrow: string;
    /** Menerima jumlah produk yang sedang tampil di katalog. */
    ctaTitle: (productCount: number) => string;
    ctaButton: string;
  };
  order: {
    button: string;
    chat: string;
    contactUs: string;
  };
  footer: {
    description: string;
    copyright: string;
  };
};

export const siteCopy: Record<Language, SiteCopy> = {
  id: {
    header: {
      home: "Beranda",
      catalog: "Katalog",
      about: "Tentang",
      contact: "Kontak",
      languageControl: "Pilih bahasa",
      openMenu: "Buka menu",
      closeMenu: "Tutup menu",
      skipToContent: "Lewati ke konten utama",
    },
    catalog: {
      eyebrow: "Katalog lengkap",
      title: "Semua mainan kayu, dalam satu halaman.",
      intro:
        "Semua yang perlu kamu tahu ada di sini — bahan, ukuran, dan isi set setiap produk. Untuk harga dan ketersediaan, tinggal tanya lewat WhatsApp.",
      searchLabel: "Cari produk",
      searchPlaceholder: "Mis. pelangi, balok, puzzle",
      categoryLabel: "Kategori",
      allCategories: "Semua kategori",
      sortLabel: "Urutkan",
      sortCatalog: "Urutan katalog",
      sortName: "Nama A–Z",
      sortYoungest: "Usia termuda",
      sortOldest: "Usia tertua",
      ageLabel: "Usia",
      ageAll: "Semua usia",
      ageYears: "tahun",
      showing: (visible, total) => `Menampilkan ${visible} dari ${total} produk`,
      clearFilters: "Bersihkan filter",
      emptyTitle: "Tidak ada yang cocok",
      emptyBody: "Coba kata kunci lain, atau longgarkan filter usia dan kategori.",
      orderEyebrow: "Cara memesan",
      orderTitle: "Kami juga menerima pesanan custom.",
      orderBody: "Sebutkan produk yang kamu minati, atau ceritakan ide yang belum ada di katalog — ukuran lain, warna lain, satu set untuk hadiah, sampai desain yang dibuat dari nol. Kirim lewat WhatsApp, dan kami balas soal ketersediaan, ukuran, serta pengiriman.",
    },
    detail: {
      home: "Beranda",
      catalog: "Katalog",
      notFoundEyebrow: "Produk tidak ditemukan",
      notFoundTitle: "Produk ini belum ada di katalog",
      notFoundBody: "Mungkin tautannya salah, atau produknya sudah tidak ditampilkan lagi.",
      notFoundCta: "Lihat semua produk",
      backToCatalog: "Kembali ke katalog",
      moreEyebrow: "Produk lain",
      moreTitle: "Lihat yang lain juga.",
      allProducts: "Semua produk",
      viewDetails: "Lihat detail",
      variantsTitle: "Varian",
      askPrice: "Tanya harga",
      variantsHint: "Pilih varian untuk melihat harganya; pesan lewat WhatsApp.",
      priceLabel: "Harga",
      priceFrom: "Mulai dari",
      specs: {
        age: "Usia disarankan",
        wood: "Jenis kayu",
        dimensions: "Ukuran",
        finish: "Finishing",
        contents: "Isi set",
        care: "Perawatan",
      },
    },
    about: {
      eyebrow: "Tentang kami",
      title: "Tidak sekadar indah dilihat.",
      intro:
        "Kami memilih bentuk yang tidak cepat membuat bosan, warna yang lembut, dan kayu yang nyaman digenggam. Mainan kayu yang mengundang anak untuk menyentuh, membangun, dan menemukan cerita mereka sendiri.",
      processEyebrow: "Dari bahan, jadi kenangan",
      processTitle: "Empat langkah, dan tidak ada yang terburu-buru.",
      process: [
        { title: "Bahan", copy: "Pinus solid untuk lengkung dan balok, kayu karet solid untuk mobil kecil, birch lapis untuk papan puzzle." },
        { title: "Bentuk", copy: "Bentuk sederhana yang tidak menunjukkan cara memainkannya. Anak yang memutuskan." },
        { title: "Finishing", copy: "Cat berbasis air dengan lapisan matte — tidak licin digenggam, dan serat kayunya sengaja tetap terlihat." },
        { title: "Perawatan", copy: "Lap dengan kain lembap lalu keringkan. Tidak perlu sabun khusus, tidak perlu pelapis tambahan." },
      ],
      values: [
        { title: "Dibuat perlahan", copy: "Setiap sudut diampelas halus agar nyaman disentuh." },
        { title: "Aman untuk si kecil", copy: "Finishing berbasis air dan material yang terpilih." },
        { title: "Untuk dimainkan lama", copy: "Bentuk sederhana, ruang imajinasi yang tidak ada habisnya." },
      ],
      ctaEyebrow: "Lihat sendiri",
      ctaTitle: (count) => `${count} koleksi, lengkap dengan ukurannya.`,
      ctaButton: "Buka katalog",
    },
    contact: {
      eyebrow: "Kontak",
      title: "Punya permintaan khusus?",
      intro: "Selain koleksi yang sudah ada, kami menerima berbagai permintaan: ukuran lain, warna lain, set hadiah, sampai mainan yang dirancang dari nol. Sebutkan produk di katalog atau ceritakan idemu, dan kami balas dengan kemungkinannya.",
      steps: [
        { title: "Lihat katalog", copy: "Semua produk ada di halaman katalog, lengkap dengan bahan, ukuran, dan isi setnya." },
        { title: "Sebutkan produknya", copy: "Buka halaman produk lalu tekan tombol pesan — nama produknya otomatis ikut tertulis. Untuk permintaan khusus, tulis saja idemu di pesan yang sama." },
        { title: "Kami balas", copy: "Kami jawab soal ketersediaan, ukuran, dan pengiriman. Setelah itu baru dibicarakan harga dan pembayaran." },
      ],
      asideTitle: "Hubungi kami",
      configuredBody: "Pemesanan dan pertanyaan dilayani lewat WhatsApp pada jam kerja.",
      destination: "Nomor tujuan",
      beforeTitle: "Sebelum menghubungi",
      before: ["Sebutkan produk yang diminati, atau ceritakan idemu.", "Sebutkan jumlahnya bila lebih dari satu.", "Untuk hadiah atau pesanan custom, sebutkan tanggal dan ukuran yang diinginkan."],
      ctaEyebrow: "Masih memilih?",
      ctaTitle: (count) => `${count} koleksi lengkap dengan spesifikasinya.`,
      ctaButton: "Buka katalog",
    },
    order: {
      button: "Pesan lewat WhatsApp",
      chat: "Chat lewat WhatsApp",
      contactUs: "Hubungi Kami",
    },
    footer: {
      description: "Galeri mainan kayu kecil untuk hari-hari yang penuh kemungkinan.",
      copyright: "© 2026 Kayu Pinoes. Dibuat untuk bermain dengan pelan.",
    },
  },

  en: {
    header: {
      home: "Home",
      catalog: "Catalog",
      about: "About",
      contact: "Contact",
      languageControl: "Choose language",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      skipToContent: "Skip to main content",
    },
    catalog: {
      eyebrow: "Full catalog",
      title: "Every wooden toy, on one page.",
      intro:
        "Everything worth knowing is here — material, dimensions, and what comes in each set. For price and availability, just ask on WhatsApp.",
      searchLabel: "Search",
      searchPlaceholder: "e.g. rainbow, blocks, puzzle",
      categoryLabel: "Category",
      allCategories: "All categories",
      sortLabel: "Sort by",
      sortCatalog: "Catalog order",
      sortName: "Name A–Z",
      sortYoungest: "Youngest first",
      sortOldest: "Oldest first",
      ageLabel: "Age",
      ageAll: "All ages",
      ageYears: "years",
      showing: (visible, total) => `Showing ${visible} of ${total} products`,
      clearFilters: "Clear filters",
      emptyTitle: "Nothing matches",
      emptyBody: "Try a different keyword, or loosen the age and category filters.",
      orderEyebrow: "How to order",
      orderTitle: "We also take custom orders.",
      orderBody: "Name the piece you like, or tell us about an idea that is not in the catalog yet — another size, another colour, a gift set, or a design made from scratch. Send it over WhatsApp, and we will reply about availability, size, and shipping.",
    },
    detail: {
      home: "Home",
      catalog: "Catalog",
      notFoundEyebrow: "Product not found",
      notFoundTitle: "This piece is not in the catalog",
      notFoundBody: "The link may be wrong, or the piece is no longer on display.",
      notFoundCta: "See all products",
      backToCatalog: "Back to catalog",
      moreEyebrow: "More pieces",
      moreTitle: "Have a look at these too.",
      allProducts: "All products",
      viewDetails: "View details",
      variantsTitle: "Options",
      askPrice: "Ask for price",
      variantsHint: "Choose an option to see its price; order through WhatsApp.",
      priceLabel: "Price",
      priceFrom: "From",
      specs: {
        age: "Recommended age",
        wood: "Wood",
        dimensions: "Dimensions",
        finish: "Finish",
        contents: "Set contents",
        care: "Care",
      },
    },
    about: {
      eyebrow: "About us",
      title: "More than lovely to look at.",
      intro:
        "We choose shapes that stay interesting, gentle colours, and wood that feels good to hold. Wooden toys that invite children to touch, build, and discover stories of their own.",
      processEyebrow: "From material to memory",
      processTitle: "Four steps, and nothing rushed.",
      process: [
        { title: "Material", copy: "Solid pine for the arches and blocks, solid rubberwood for the little car, plywood birch for the puzzle board." },
        { title: "Form", copy: "Simple shapes that do not tell a child how to play. They decide." },
        { title: "Finish", copy: "Water-based paint with a matte finish — not slippery to hold, and the wood grain is left visible on purpose." },
        { title: "Care", copy: "Wipe with a damp cloth, then dry. No special soap, no extra coating needed." },
      ],
      values: [
        { title: "Made slowly", copy: "Every edge is sanded smooth for comfortable little hands." },
        { title: "Safe for little ones", copy: "Water-based finishes and carefully selected materials." },
        { title: "Made for years of play", copy: "Simple forms with room for imagination that never runs out." },
      ],
      ctaEyebrow: "See for yourself",
      ctaTitle: (count) => `${count} pieces, dimensions and all.`,
      ctaButton: "Open the catalog",
    },
    contact: {
      eyebrow: "Contact",
      title: "Something specific in mind?",
      intro: "Beyond the collection, we take all kinds of requests: another size, another colour, a gift set, or a toy designed from scratch. Name a piece from the catalog or describe your idea, and we will reply with what is possible.",
      steps: [
        { title: "Browse the catalog", copy: "Every piece is listed with its material, dimensions, and what comes in the set." },
        { title: "Name the piece", copy: "Open a product page and press the order button — the product name is written into the message for you. For a custom request, just describe your idea in the same message." },
        { title: "We reply", copy: "We answer about availability, size, and shipping. Price and payment come after that." },
      ],
      asideTitle: "Get in touch",
      configuredBody: "Orders and questions are handled over WhatsApp during working hours.",
      destination: "Destination number",
      beforeTitle: "Before you write",
      before: ["Name the piece you like, or describe your idea.", "Mention the quantity if it is more than one.", "For a gift or a custom order, tell us the date and the size you need."],
      ctaEyebrow: "Still deciding?",
      ctaTitle: (count) => `${count} pieces with their full specifications.`,
      ctaButton: "Open the catalog",
    },
    order: {
      button: "Order on WhatsApp",
      chat: "Chat on WhatsApp",
      contactUs: "Contact us",
    },
    footer: {
      description: "A small wooden-toy gallery for days full of possibility.",
      copyright: "© 2026 Kayu Pinoes. Made for unhurried play.",
    },
  },

  ar: {
    header: {
      home: "الرئيسية",
      catalog: "الكتالوج",
      about: "من نحن",
      contact: "اتصل بنا",
      languageControl: "اختر اللغة",
      openMenu: "افتح القائمة",
      closeMenu: "أغلق القائمة",
      skipToContent: "انتقل إلى المحتوى الرئيسي",
    },
    catalog: {
      eyebrow: "الكتالوج الكامل",
      title: "كل الألعاب الخشبية في صفحة واحدة.",
      intro: "كل ما يهمّ موجود هنا — المادة والمقاسات ومحتويات كل طقم. للسعر والتوفر، اسألنا عبر واتساب.",
      searchLabel: "ابحث",
      searchPlaceholder: "مثال: قوس قزح، مكعبات، أحجية",
      categoryLabel: "الفئة",
      allCategories: "كل الفئات",
      sortLabel: "الترتيب",
      sortCatalog: "ترتيب الكتالوج",
      sortName: "الاسم أ–ي",
      sortYoungest: "الأصغر أولاً",
      sortOldest: "الأكبر أولاً",
      ageLabel: "العمر",
      ageAll: "كل الأعمار",
      ageYears: "سنوات",
      showing: (visible, total) => `عرض ${visible} من ${total} منتجًا`,
      clearFilters: "مسح عوامل التصفية",
      emptyTitle: "لا يوجد تطابق",
      emptyBody: "جرّب كلمة أخرى، أو خفّف عوامل التصفية.",
      orderEyebrow: "كيف تطلب",
      orderTitle: "نستقبل أيضًا الطلبات الخاصة.",
      orderBody: "اذكر القطعة التي تهمك، أو أخبرنا بفكرة ليست في الكتالوج بعد — مقاس آخر، لون آخر، طقم هدايا، أو تصميم من الصفر. أرسلها عبر واتساب، وسنرد بشأن التوفر والمقاس والشحن.",
    },
    detail: {
      home: "الرئيسية",
      catalog: "الكتالوج",
      notFoundEyebrow: "المنتج غير موجود",
      notFoundTitle: "هذه القطعة ليست في الكتالوج",
      notFoundBody: "قد يكون الرابط غير صحيح، أو لم تعد القطعة معروضة.",
      notFoundCta: "عرض كل المنتجات",
      backToCatalog: "العودة إلى الكتالوج",
      moreEyebrow: "قطع أخرى",
      moreTitle: "ألقِ نظرة على هذه أيضًا.",
      allProducts: "كل المنتجات",
      viewDetails: "عرض التفاصيل",
      variantsTitle: "الخيارات",
      askPrice: "اسأل عن السعر",
      variantsHint: "اختر خيارًا لعرض سعره؛ واطلب عبر واتساب.",
      priceLabel: "السعر",
      priceFrom: "ابتداءً من",
      specs: {
        age: "العمر المقترح",
        wood: "نوع الخشب",
        dimensions: "المقاسات",
        finish: "التشطيب",
        contents: "محتويات المجموعة",
        care: "العناية",
      },
    },
    about: {
      eyebrow: "من نحن",
      title: "أكثر من مجرد جمالٍ للنظر.",
      intro:
        "نختار أشكالاً لا تفقد بريقها سريعاً، وألواناً هادئة، وخشباً مريحاً في الإمساك. ألعاب خشبية تدعو الأطفال إلى اللمس والبناء واكتشاف حكاياتهم الخاصة.",
      processEyebrow: "من المادة إلى الذكرى",
      processTitle: "أربع خطوات، دون عجلة.",
      process: [
        { title: "المادة", copy: "خشب صنوبر صلب للأقواس والمكعبات، وخشب مطاط صلب للسيارة الصغيرة، وخشب بتولا رقائقي للوح الأحجية." },
        { title: "الشكل", copy: "أشكال بسيطة لا تملي على الطفل طريقة اللعب. هو من يقرر." },
        { title: "التشطيب", copy: "طلاء مائي بتشطيب مطفي — غير زلق عند الإمساك، وتُترك عروق الخشب ظاهرة عن قصد." },
        { title: "العناية", copy: "يُمسح بقطعة قماش مبللة ثم يُجفف. دون صابون خاص أو طبقة إضافية." },
      ],
      values: [
        { title: "صُنعت على مهل", copy: "كل زاوية مصقولة بسلاسة لتكون مريحة عند اللمس." },
        { title: "آمنة للصغار", copy: "تشطيبات مائية ومواد مختارة بعناية." },
        { title: "للعب طويل الأمد", copy: "أشكال بسيطة ومساحة لخيال لا ينتهي." },
      ],
      ctaEyebrow: "شاهد بنفسك",
      ctaTitle: (count) => `${count} قطع بمقاساتها الكاملة.`,
      ctaButton: "افتح الكتالوج",
    },
    contact: {
      eyebrow: "اتصل بنا",
      title: "لديك طلب خاص؟",
      intro: "إلى جانب المجموعة، نستقبل طلبات متنوعة: مقاس آخر، لون آخر، طقم هدايا، أو لعبة تُصمَّم من الصفر. اذكر قطعة من الكتالوج أو اشرح فكرتك، وسنرد بما هو ممكن.",
      steps: [
        { title: "تصفّح الكتالوج", copy: "كل قطعة مدرجة مع موادها ومقاساتها ومحتوياتها." },
        { title: "اذكر القطعة", copy: "افتح صفحة المنتج واضغط زر الطلب — يُكتب اسم المنتج في الرسالة تلقائيًا. للطلبات الخاصة، اكتب فكرتك في الرسالة نفسها." },
        { title: "نرد عليك", copy: "نجيب بشأن التوفر والمقاس والشحن. ثم يأتي السعر والدفع بعد ذلك." },
      ],
      asideTitle: "تواصل معنا",
      configuredBody: "تُدار الطلبات والأسئلة عبر واتساب خلال ساعات العمل.",
      destination: "رقم الاستقبال",
      beforeTitle: "قبل أن تراسلنا",
      before: ["اذكر القطعة التي تهمك أو اشرح فكرتك.", "اذكر الكمية إن كانت أكثر من واحدة.", "للإهداء أو الطلب الخاص، أخبرنا بالتاريخ والمقاس المطلوب."],
      ctaEyebrow: "ما زلت تختار؟",
      ctaTitle: (count) => `${count} قطع بمواصفاتها الكاملة.`,
      ctaButton: "افتح الكتالوج",
    },
    order: {
      button: "اطلب عبر واتساب",
      chat: "محادثة على واتساب",
      contactUs: "اتصل بنا",
    },
    footer: {
      description: "معرض صغير للألعاب الخشبية لأيام مليئة بالاحتمالات.",
      copyright: "© 2026 كايو بينويس. صُنعت للعب على مهل.",
    },
  },
};
