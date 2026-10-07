import { productSeeds, type Product } from "./products.ts";

export const supportedLanguages = ["id", "en", "ar"] as const;

export type Language = (typeof supportedLanguages)[number];

type ProductCopy = Pick<
  Product,
  "name" | "category" | "age" | "description" | "wood" | "dimensions" | "finish" | "contents" | "care"
>;

type Translation = {
  direction: "ltr" | "rtl";
  languageControl: string;
  skipToContent: string;
  homeLabel: string;
  primaryNavigation: string;
  mobileNavigation: string;
  openMenu: string;
  closeMenu: string;
  nav: {
    catalog: string;
    about: string;
    contact: string;
  };
  hero: {
    eyebrow: string;
    title: [string, string];
    description: string;
    browseCollection: string;
    meetBrand: string;
    selectedWood: string;
    madeWithCare: string;
    imageAlt: string;
    waterBasedPaint: string;
    playBadge: string;
  };
  collection: {
    eyebrow: string;
    title: string;
    allCollections: string;
    categories: Array<{
      name: string;
      description: string;
    }>;
  };
  gallery: {
    eyebrow: string;
    title: string;
    description: string;
    viewSpecifications: string;
    addFavorite: (name: string) => string;
    removeFavorite: (name: string) => string;
  };
  story: {
    eyebrow: string;
    title: string;
    description: string;
    howWeMakeIt: string;
    graphicLabel: string;
  };
  values: Array<{
    title: string;
    copy: string;
  }>;
  detail: {
    collectionLabel: string;
    closeDetail: (name: string) => string;
    age: string;
    wood: string;
    dimensions: string;
    finish: string;
    contents: string;
    care: string;
    /** Judul daftar varian, mis. "Varian". */
    variantsTitle: string;
    /** Ditampilkan bila sebuah varian belum ada harganya. */
    askPrice: string;
    /** Keterangan kecil di bawah daftar varian. */
    variantsHint: string;
  };
  footer: {
    description: string;
    copyright: string;
  };
  products: Record<number, ProductCopy>;
};

export const languageOptions: Array<{ code: Language; label: string }> = [
  { code: "id", label: "Bahasa Indonesia" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
];

export const translations = {
  id: {
    direction: "ltr",
    languageControl: "Pilih bahasa",
    skipToContent: "Lewati ke konten utama",
    homeLabel: "Kayu Pinoes beranda",
    primaryNavigation: "Navigasi utama",
    mobileNavigation: "Navigasi seluler",
    openMenu: "Buka menu",
    closeMenu: "Tutup menu",
    nav: {
      catalog: "Katalog",
      about: "Tentang",
      contact: "Kontak",
    },
    hero: {
      eyebrow: "dibuat untuk bertumbuh",
      title: ["Kecil di tangan,", "besar di imajinasi."],
      description: "Mainan kayu yang mengundang anak untuk menyentuh, membangun, dan menemukan cerita mereka sendiri.",
      browseCollection: "Jelajahi koleksi",
      meetBrand: "Kenal Kayu Pinoes",
      selectedWood: "Kayu pilihan",
      madeWithCare: "Dibuat dengan hati",
      imageAlt: "Susunan mainan kayu pelangi, bebek tarik, balok, dan mobil kecil",
      waterBasedPaint: "Cat berbasis air, halus untuk tangan kecil.",
      playBadge: "bermain",
    },
    collection: {
      eyebrow: "pilih cara bermain",
      title: "Temukan teman bermainnya.",
      allCollections: "Lihat semua koleksi",
      categories: [
        { name: "Main sambil belajar", description: "Balok, bentuk, dan warna" },
        { name: "Gerak & jelajah", description: "Tarik, dorong, lalu pergi" },
        { name: "Teman tumbuh", description: "Dari pagi sampai malam" },
      ],
    },
    gallery: {
      eyebrow: "galeri pilihan",
      title: "Setiap mainan, punya cerita.",
      description: "Lihat bahan, ukuran, dan detail kecil yang membentuk tiap koleksi.",
      viewSpecifications: "Lihat spesifikasi",
      addFavorite: (name) => `Tambahkan ${name} ke favorit`,
      removeFavorite: (name) => `Hapus ${name} dari favorit`,
    },
    story: {
      eyebrow: "dari bahan, jadi kenangan",
      title: "Tidak sekadar indah dilihat.",
      description: "Kami memilih bentuk yang tidak cepat membuat bosan, warna yang lembut, dan kayu yang nyaman digenggam.",
      howWeMakeIt: "Cara kami membuatnya",
      graphicLabel: "Tumbuh bersama.",
    },
    values: [
      { title: "Dibuat perlahan", copy: "Setiap sudut diampelas halus agar nyaman disentuh." },
      { title: "Aman untuk si kecil", copy: "Finishing berbasis air dan material yang terpilih." },
      { title: "Untuk dimainkan lama", copy: "Bentuk sederhana, ruang imajinasi yang tidak ada habisnya." },
    ],
    detail: {
      collectionLabel: "Kayu Pinoes · koleksi",
      closeDetail: (name) => `Tutup detail ${name}`,
      age: "Usia disarankan",
      wood: "Jenis kayu",
      dimensions: "Ukuran",
      finish: "Finishing",
      contents: "Isi set",
      care: "Perawatan",
      variantsTitle: "Varian",
      askPrice: "Tanya harga",
      variantsHint: "Klik varian untuk memesan lewat WhatsApp.",
    },
    footer: {
      description: "Galeri mainan kayu kecil untuk hari-hari yang penuh kemungkinan.",
      copyright: "© 2026 Kayu Pinoes. Dibuat untuk bermain dengan pelan.",
    },
    products: {
      1: {
        name: "Pelangi Susun",
        category: "Main sambil belajar",
        age: "1–4 tahun",
        description: "Enam lengkung lembut yang bisa disusun menjadi jembatan, rumah, atau dunia kecil versi mereka.",
        wood: "Kayu pinus solid",
        dimensions: "28 × 14 × 5 cm",
        finish: "Cat berbasis air, lapisan matte",
        contents: "6 lengkung kayu",
        care: "Lap dengan kain lembap, lalu keringkan. Hindari direndam.",
      },
      2: {
        name: "Mobil Kecil Kiko",
        category: "Gerak & jelajah",
        age: "2–5 tahun",
        description: "Mobil kecil beroda bebas untuk perjalanan mengelilingi ruang keluarga dan cerita yang terus bergerak.",
        wood: "Kayu karet solid",
        dimensions: "16 × 10 × 8 cm",
        finish: "Cat berbasis air, lapisan matte",
        contents: "1 mobil kayu",
        care: "Lap dengan kain lembap, lalu keringkan. Hindari direndam.",
      },
      3: {
        name: "Balok Cerita",
        category: "Main sambil belajar",
        age: "1–5 tahun",
        description: "Sekumpulan bentuk sederhana untuk menara yang tinggi, kota imajiner, dan percakapan tanpa aturan.",
        wood: "Kayu pinus solid",
        dimensions: "Kotak penyimpanan 25 × 18 × 7 cm",
        finish: "Cat berbasis air, lapisan matte",
        contents: "24 balok dengan 6 bentuk",
        care: "Lap dengan kain lembap, lalu keringkan. Simpan dalam keadaan kering.",
      },
      4: {
        name: "Puzzle Kebun Pagi",
        category: "Teman tumbuh",
        age: "3–6 tahun",
        description: "Potongan berwarna lembut yang mengajak tangan kecil mengenali bentuk sambil menyusun suasana pagi.",
        wood: "Kayu birch lapis",
        dimensions: "22 × 22 × 1,2 cm",
        finish: "Cat berbasis air, lapisan matte",
        contents: "1 papan puzzle, 6 keping",
        care: "Lap dengan kain lembap, lalu keringkan. Hindari paparan air berlebih.",
      },
      5: {
        name: "Menara Angka",
        category: "Main sambil belajar",
        age: "1–3 tahun",
        description: "Enam gelang warna yang disusun dari besar ke kecil, dengan angka terukir di setiap tingkatnya.",
        wood: "Kayu pinus solid",
        dimensions: "12 × 12 × 21 cm",
        finish: "Cat berbasis air, lapisan matte",
        contents: "6 gelang kayu dan 1 tiang",
        care: "Lap dengan kain lembap, lalu keringkan. Hindari direndam.",
      },
      6: {
        name: "Bebek Tarik Dodo",
        category: "Gerak & jelajah",
        age: "1–3 tahun",
        description: "Bebek kayu bertali yang mengikuti langkah kecil, rodanya berputar dan kepalanya bergoyang.",
        wood: "Kayu karet solid",
        dimensions: "20 × 9 × 13 cm, tali 50 cm",
        finish: "Cat berbasis air, lapisan matte",
        contents: "1 bebek tarik dengan tali",
        care: "Lap dengan kain lembap, lalu keringkan. Hindari direndam.",
      },
      7: {
        name: "Xilofon Melodi",
        category: "Main sambil belajar",
        age: "2–5 tahun",
        description: "Delapan bilah nada di atas badan kayu, cukup keras untuk tangan kecil dan cukup lembut untuk rumah yang tenang.",
        wood: "Kayu pinus solid dengan bilah logam",
        dimensions: "26 × 15 × 4 cm",
        finish: "Cat berbasis air, lapisan matte",
        contents: "1 xilofon dan 2 pemukul kayu",
        care: "Lap dengan kain lembap, lalu keringkan. Hindari direndam.",
      },
      8: {
        name: "Jam Kayu Waktu",
        category: "Teman tumbuh",
        age: "3–6 tahun",
        description: "Papan jam dengan dua jarum yang bisa diputar sendiri, untuk mengenal angka dan urutan hari.",
        wood: "Kayu birch lapis",
        dimensions: "24 × 24 × 2,4 cm",
        finish: "Cat berbasis air, lapisan matte",
        contents: "1 papan jam dengan 2 jarum",
        care: "Lap dengan kain lembap, lalu keringkan. Hindari direndam.",
      },
    },
  },
  en: {
    direction: "ltr",
    languageControl: "Choose language",
    skipToContent: "Skip to main content",
    homeLabel: "Kayu Pinoes home",
    primaryNavigation: "Primary navigation",
    mobileNavigation: "Mobile navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    nav: {
      catalog: "Catalog",
      about: "About",
      contact: "Contact",
    },
    hero: {
      eyebrow: "made for growing",
      title: ["Small in their hands,", "big in their imagination."],
      description: "Wooden toys that invite children to touch, build, and discover stories of their own.",
      browseCollection: "Browse the collection",
      meetBrand: "Meet Kayu Pinoes",
      selectedWood: "Thoughtfully chosen wood",
      madeWithCare: "Made with care",
      imageAlt: "An arrangement of rainbow, pull-duck, block, and small car wooden toys",
      waterBasedPaint: "Water-based paint, gentle for small hands.",
      playBadge: "play",
    },
    collection: {
      eyebrow: "choose how to play",
      title: "Find a playful companion.",
      allCollections: "See all collections",
      categories: [
        { name: "Learn through play", description: "Blocks, shapes, and colours" },
        { name: "Move & explore", description: "Pull, push, and go" },
        { name: "Growing companions", description: "From morning to night" },
      ],
    },
    gallery: {
      eyebrow: "selected gallery",
      title: "Every toy has a story.",
      description: "Discover the materials, measurements, and small details behind every collection.",
      viewSpecifications: "View specifications",
      addFavorite: (name) => `Add ${name} to favourites`,
      removeFavorite: (name) => `Remove ${name} from favourites`,
    },
    story: {
      eyebrow: "from material to memory",
      title: "More than lovely to look at.",
      description: "We choose shapes that stay interesting, gentle colours, and wood that feels good to hold.",
      howWeMakeIt: "How we make it",
      graphicLabel: "Growing together.",
    },
    values: [
      { title: "Made slowly", copy: "Every edge is sanded smooth for comfortable little hands." },
      { title: "Safe for little ones", copy: "Water-based finishes and carefully selected materials." },
      { title: "Made for years of play", copy: "Simple forms with room for imagination that never runs out." },
    ],
    detail: {
      collectionLabel: "Kayu Pinoes · collection",
      closeDetail: (name) => `Close ${name} details`,
      age: "Recommended age",
      wood: "Wood type",
      dimensions: "Dimensions",
      finish: "Finish",
      contents: "Set contents",
      care: "Care",
      variantsTitle: "Options",
      askPrice: "Ask for price",
      variantsHint: "Tap an option to order via WhatsApp.",
    },
    footer: {
      description: "A small wooden-toy gallery for days full of possibility.",
      copyright: "© 2026 Kayu Pinoes. Made for unhurried play.",
    },
    products: {
      1: {
        name: "Stacking Rainbow",
        category: "Learn through play",
        age: "1–4 years",
        description: "Six gentle arches that become a bridge, a house, or a little world of their own.",
        wood: "Solid pine wood",
        dimensions: "28 × 14 × 5 cm",
        finish: "Water-based paint, matte finish",
        contents: "6 wooden arches",
        care: "Wipe with a damp cloth, then dry. Do not soak.",
      },
      2: {
        name: "Kiko Little Car",
        category: "Move & explore",
        age: "2–5 years",
        description: "A little free-rolling car for trips around the living room and stories that keep moving.",
        wood: "Solid rubberwood",
        dimensions: "16 × 10 × 8 cm",
        finish: "Water-based paint, matte finish",
        contents: "1 wooden car",
        care: "Wipe with a damp cloth, then dry. Do not soak.",
      },
      3: {
        name: "Story Blocks",
        category: "Learn through play",
        age: "1–5 years",
        description: "A collection of simple shapes for tall towers, imaginary cities, and conversations without rules.",
        wood: "Solid pine wood",
        dimensions: "Storage box 25 × 18 × 7 cm",
        finish: "Water-based paint, matte finish",
        contents: "24 blocks in 6 shapes",
        care: "Wipe with a damp cloth, then dry. Store dry.",
      },
      4: {
        name: "Morning Garden Puzzle",
        category: "Growing companions",
        age: "3–6 years",
        description: "Softly coloured pieces that invite little hands to recognise shapes while arranging a morning scene.",
        wood: "Plywood birch",
        dimensions: "22 × 22 × 1.2 cm",
        finish: "Water-based paint, matte finish",
        contents: "1 puzzle board, 6 pieces",
        care: "Wipe with a damp cloth, then dry. Avoid excess water.",
      },
      5: {
        name: "Number Tower",
        category: "Learn through play",
        age: "1–3 years",
        description: "Six coloured rings stacked from large to small, with a number carved into every level.",
        wood: "Solid pine wood",
        dimensions: "12 × 12 × 21 cm",
        finish: "Water-based paint, matte finish",
        contents: "6 wooden rings and 1 post",
        care: "Wipe with a damp cloth, then dry. Do not soak.",
      },
      6: {
        name: "Dodo Pull Duck",
        category: "Move & explore",
        age: "1–3 years",
        description: "A stringed wooden duck that follows little footsteps, wheels turning and head bobbing.",
        wood: "Solid rubberwood",
        dimensions: "20 × 9 × 13 cm, 50 cm string",
        finish: "Water-based paint, matte finish",
        contents: "1 pull duck with string",
        care: "Wipe with a damp cloth, then dry. Do not soak.",
      },
      7: {
        name: "Melody Xylophone",
        category: "Learn through play",
        age: "2–5 years",
        description: "Eight note bars on a wooden body, loud enough for small hands and gentle enough for a quiet house.",
        wood: "Solid pine wood with metal bars",
        dimensions: "26 × 15 × 4 cm",
        finish: "Water-based paint, matte finish",
        contents: "1 xylophone and 2 wooden mallets",
        care: "Wipe with a damp cloth, then dry. Do not soak.",
      },
      8: {
        name: "Time Wooden Clock",
        category: "Growing companions",
        age: "3–6 years",
        description: "A clock board with two hands a child can turn by hand, for learning numbers and the shape of a day.",
        wood: "Plywood birch",
        dimensions: "24 × 24 × 2.4 cm",
        finish: "Water-based paint, matte finish",
        contents: "1 clock board with 2 hands",
        care: "Wipe with a damp cloth, then dry. Do not soak.",
      },
    },
  },
  ar: {
    direction: "rtl",
    languageControl: "اختر اللغة",
    skipToContent: "انتقل إلى المحتوى الرئيسي",
    homeLabel: "الصفحة الرئيسية لكايو بينويس",
    primaryNavigation: "التنقل الرئيسي",
    mobileNavigation: "تنقل الجوال",
    openMenu: "افتح القائمة",
    closeMenu: "أغلق القائمة",
    nav: {
      catalog: "الكتالوج",
      about: "من نحن",
      contact: "اتصل بنا",
    },
    hero: {
      eyebrow: "صُممت للنمو",
      title: ["صغيرة في أيديهم،", "كبيرة في خيالهم."],
      description: "ألعاب خشبية تدعو الأطفال إلى اللمس والبناء واكتشاف حكاياتهم الخاصة.",
      browseCollection: "استكشف المجموعة",
      meetBrand: "تعرّف إلى كايو بينويس",
      selectedWood: "خشب مختار بعناية",
      madeWithCare: "صُنعت بعناية",
      imageAlt: "تشكيلة من ألعاب خشبية على شكل قوس قزح وبطة سحب ومكعبات وسيارة صغيرة",
      waterBasedPaint: "ألوان مائية لطيفة على الأيدي الصغيرة.",
      playBadge: "للعب",
    },
    collection: {
      eyebrow: "اختر طريقة اللعب",
      title: "اعثر على رفيق اللعب.",
      allCollections: "شاهد كل المجموعات",
      categories: [
        { name: "التعلّم باللعب", description: "مكعبات وأشكال وألوان" },
        { name: "الحركة والاستكشاف", description: "اسحب وادفع وانطلق" },
        { name: "رفيق النمو", description: "من الصباح حتى المساء" },
      ],
    },
    gallery: {
      eyebrow: "معرض مختار",
      title: "لكل لعبة حكاية.",
      description: "تعرّف إلى المواد والمقاسات والتفاصيل الصغيرة التي تُكمل كل مجموعة.",
      viewSpecifications: "عرض المواصفات",
      addFavorite: (name) => `أضف ${name} إلى المفضلة`,
      removeFavorite: (name) => `أزل ${name} من المفضلة`,
    },
    story: {
      eyebrow: "من المادة إلى الذكرى",
      title: "أكثر من مجرد جمالٍ للنظر.",
      description: "نختار أشكالاً لا تفقد بريقها سريعاً، وألواناً هادئة، وخشباً مريحاً في الإمساك.",
      howWeMakeIt: "كيف نصنعها",
      graphicLabel: "ننمو معاً.",
    },
    values: [
      { title: "صُنعت على مهل", copy: "كل زاوية مصقولة بسلاسة لتكون مريحة عند اللمس." },
      { title: "آمنة للصغار", copy: "تشطيبات مائية ومواد مختارة بعناية." },
      { title: "للعب طويل الأمد", copy: "أشكال بسيطة ومساحة لخيال لا ينتهي." },
    ],
    detail: {
      collectionLabel: "كايو بينويس · المجموعة",
      closeDetail: (name) => `أغلق تفاصيل ${name}`,
      age: "العمر المقترح",
      wood: "نوع الخشب",
      dimensions: "المقاسات",
      finish: "التشطيب",
      contents: "محتويات المجموعة",
      care: "العناية",
      variantsTitle: "الخيارات",
      askPrice: "اسأل عن السعر",
      variantsHint: "انقر على الخيار للطلب عبر واتساب.",
    },
    footer: {
      description: "معرض صغير للألعاب الخشبية لأيام مليئة بالاحتمالات.",
      copyright: "© 2026 كايو بينويس. صُنعت للعب على مهل.",
    },
    products: {
      1: {
        name: "قوس قزح قابل للتركيب",
        category: "التعلّم باللعب",
        age: "١–٤ سنوات",
        description: "ستة أقواس ناعمة يمكن ترتيبها لتصبح جسراً أو بيتاً أو عالماً صغيراً خاصاً بهم.",
        wood: "خشب صنوبر صلب",
        dimensions: "٢٨ × ١٤ × ٥ سم",
        finish: "طلاء مائي بتشطيب مطفي",
        contents: "٦ أقواس خشبية",
        care: "يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء.",
      },
      2: {
        name: "سيارة كيكو الصغيرة",
        category: "الحركة والاستكشاف",
        age: "٢–٥ سنوات",
        description: "سيارة صغيرة بعجلات حرة لرحلات حول غرفة المعيشة وحكايات لا تتوقف عن الحركة.",
        wood: "خشب مطاط صلب",
        dimensions: "١٦ × ١٠ × ٨ سم",
        finish: "طلاء مائي بتشطيب مطفي",
        contents: "سيارة خشبية واحدة",
        care: "يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء.",
      },
      3: {
        name: "مكعبات الحكايات",
        category: "التعلّم باللعب",
        age: "١–٥ سنوات",
        description: "مجموعة من الأشكال البسيطة للأبراج العالية والمدن الخيالية والحوارات بلا قواعد.",
        wood: "خشب صنوبر صلب",
        dimensions: "صندوق حفظ ٢٥ × ١٨ × ٧ سم",
        finish: "طلاء مائي بتشطيب مطفي",
        contents: "٢٤ مكعباً بـ٦ أشكال",
        care: "يُمسح بقطعة قماش مبللة ثم يُجفف. يُحفظ جافاً.",
      },
      4: {
        name: "أحجية حديقة الصباح",
        category: "رفيق النمو",
        age: "٣–٦ سنوات",
        description: "قطع بألوان هادئة تدعو الأيدي الصغيرة إلى تمييز الأشكال أثناء ترتيب مشهد صباحي.",
        wood: "خشـب بتولا رقائقي",
        dimensions: "٢٢ × ٢٢ × ١٫٢ سم",
        finish: "طلاء مائي بتشطيب مطفي",
        contents: "لوح أحجية واحد و٦ قطع",
        care: "يُمسح بقطعة قماش مبللة ثم يُجفف. تجنب الماء الزائد.",
      },
      5: {
        name: "برج الأرقام",
        category: "التعلّم باللعب",
        age: "١–٣ سنوات",
        description: "ست حلقات ملوّنة تُرتّب من الأكبر إلى الأصغر، مع رقم محفور على كل مستوى.",
        wood: "خشب صنوبر صلب",
        dimensions: "١٢ × ١٢ × ٢١ سم",
        finish: "طلاء مائي بتشطيب مطفي",
        contents: "٦ حلقات خشبية وعمود واحد",
        care: "يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء.",
      },
      6: {
        name: "بطة الجر دودو",
        category: "الحركة والاستكشاف",
        age: "١–٣ سنوات",
        description: "بطة خشبية بحبل تتبع الخطوات الصغيرة، تدور عجلاتها ويتمايل رأسها.",
        wood: "خشب مطاط صلب",
        dimensions: "٢٠ × ٩ × ١٣ سم، حبل ٥٠ سم",
        finish: "طلاء مائي بتشطيب مطفي",
        contents: "بطة جر واحدة مع حبل",
        care: "يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء.",
      },
      7: {
        name: "زيلوفون الألحان",
        category: "التعلّم باللعب",
        age: "٢–٥ سنوات",
        description: "ثمانية قضبان نغمية على جسم خشبي، عالية بما يكفي للأيدي الصغيرة وهادئة بما يكفي للبيت.",
        wood: "خشب صنوبر صلب مع قضبان معدنية",
        dimensions: "٢٦ × ١٥ × ٤ سم",
        finish: "طلاء مائي بتشطيب مطفي",
        contents: "زيلوفون واحد ومطرقتان خشبيتان",
        care: "يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء.",
      },
      8: {
        name: "ساعة الوقت الخشبية",
        category: "رفيق النمو",
        age: "٣–٦ سنوات",
        description: "لوح ساعة بعقربين يمكن للطفل تدويرهما بيده، للتعرّف على الأرقام وتسلسل اليوم.",
        wood: "خشب بتولا رقائقي",
        dimensions: "٢٤ × ٢٤ × ٢٫٤ سم",
        finish: "طلاء مائي بتشطيب مطفي",
        contents: "لوح ساعة واحد بعقربين",
        care: "يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء.",
      },
    },
  },
} satisfies Record<Language, Translation>;

export function getLocalizedProducts(language: Language): Product[] {
  // Teks produk hidup di berkas ini saja; data warna/ilustrasi datang dari
  // productSeeds. Sebelumnya teks diduplikasi di products.ts dan selalu tertimpa.
  const copy = translations[language].products as unknown as Record<number, ProductCopy>;
  const fallback = translations.id.products as unknown as Record<number, ProductCopy>;

  return productSeeds.map((seed) => ({
    ...seed,
    ...(copy[seed.id] ?? fallback[seed.id]),
  }));
}
