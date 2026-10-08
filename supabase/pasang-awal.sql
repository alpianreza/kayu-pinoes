-- ============================================================================
-- KAYU PINOES - PEMASANGAN SUPABASE (paket lengkap, sekali jalan)
-- ============================================================================
-- Cara pakai:
--   1. Buka dashboard Supabase -> menu 'SQL Editor'.
--   2. Tempel SELURUH isi berkas ini -> klik 'Run'.
--   3. Di akhir akan tampil tabel pemeriksaan. Angka yang benar:
--      produk 8 | terjemahan 24 | kategori 3 | usia 5 | material 4 |
--      finishing 1 | foto 8 | varian 0.
-- Paket ini MENGGANTIKAN versi pertama (struktur JSONB). Aman dijalankan ulang.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- BAGIAN 0: bersihkan tabel lama versi JSONB (hanya jika polanya cocok).
-- ----------------------------------------------------------------------------
do $guard$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'translations'
  ) then
    drop table public.products cascade;
  end if;
end;
$guard$;

-- ============================================================================
-- 001 - Skema inti relasional Kayu Pinoes.
-- ============================================================================
-- Menggantikan struktur Firestore (dokumen JSONB) dengan tabel relasional.
-- Aman dijalankan ulang (idempotent).
-- ============================================================================


-- Bahasa yang didukung situs. id = kode bahasa (id/en/ar).
create table if not exists public.languages (
  id          text primary key,
  name        text not null,
  direction   text not null default 'ltr' check (direction in ('ltr', 'rtl')),
  sort_order  integer not null default 0,
  is_active   boolean not null default true
);

-- Mata uang untuk harga varian.
create table if not exists public.currencies (
  id         smallserial primary key,
  code       text not null unique,
  symbol     text not null,
  name       text not null,
  is_active  boolean not null default true
);

-- Kategori produk (mis. "Main sambil belajar").
create table if not exists public.categories (
  id          bigserial primary key,
  slug        text not null unique,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.category_translations (
  category_id  bigint not null references public.categories(id) on delete cascade,
  language_id  text not null references public.languages(id) on delete cascade,
  name         text not null default '',
  primary key (category_id, language_id)
);

-- Rentang usia dalam bulan; teks tampilan ("1-4 tahun") dibentuk aplikasi.
create table if not exists public.age_ranges (
  id          bigserial primary key,
  min_months  integer not null check (min_months >= 0),
  max_months  integer not null check (max_months >= min_months),
  sort_order  integer not null default 0,
  unique (min_months, max_months)
);

-- Material kayu.
create table if not exists public.materials (
  id          bigserial primary key,
  code        text unique,
  sort_order  integer not null default 0,
  is_active   boolean not null default true
);

create table if not exists public.material_translations (
  material_id  bigint not null references public.materials(id) on delete cascade,
  language_id  text not null references public.languages(id) on delete cascade,
  name         text not null default '',
  primary key (material_id, language_id)
);

-- Finishing / lapisan akhir.
create table if not exists public.finishings (
  id          bigserial primary key,
  code        text unique,
  sort_order  integer not null default 0,
  is_active   boolean not null default true
);

create table if not exists public.finishing_translations (
  finishing_id  bigint not null references public.finishings(id) on delete cascade,
  language_id   text not null references public.languages(id) on delete cascade,
  name          text not null default '',
  primary key (finishing_id, language_id)
);

-- Produk (data non-bahasa saja).
create table if not exists public.products (
  id            bigint primary key,
  slug          text not null unique,
  status        text not null default 'draft' check (status in ('draft', 'published')),
  sort_order    integer not null default 0,
  surface       text not null check (surface ~ '^#[0-9a-fA-F]{6}$'),
  accent        text not null check (accent ~ '^#[0-9a-fA-F]{6}$'),
  illustration  text not null check (illustration in (
                  'mainan', 'rainbow', 'car', 'blocks', 'puzzle',
                  'hewan', 'boneka', 'menara', 'musik', 'jam'
                )),
  material_id   bigint references public.materials(id) on delete set null,
  finishing_id  bigint references public.finishings(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Teks produk per bahasa.
create table if not exists public.product_translations (
  product_id   bigint not null references public.products(id) on delete cascade,
  language_id  text not null references public.languages(id) on delete cascade,
  name         text not null default '',
  description  text not null default '',
  dimensions   text not null default '',
  contents     text not null default '',
  care         text not null default '',
  primary key (product_id, language_id)
);

-- Kaitan produk <-> kategori (satu produk boleh punya beberapa).
create table if not exists public.product_categories (
  product_id   bigint not null references public.products(id) on delete cascade,
  category_id  bigint not null references public.categories(id) on delete cascade,
  is_primary   boolean not null default false,
  primary key (product_id, category_id)
);

-- Kaitan produk <-> rentang usia.
create table if not exists public.product_age_ranges (
  product_id    bigint not null references public.products(id) on delete cascade,
  age_range_id  bigint not null references public.age_ranges(id) on delete cascade,
  primary key (product_id, age_range_id)
);

-- Varian produk (mis. ukuran).
create table if not exists public.product_variants (
  id          bigserial primary key,
  product_id  bigint not null references public.products(id) on delete cascade,
  code        text not null,
  sort_order  integer not null default 0,
  is_default  boolean not null default false,
  is_active   boolean not null default true,
  unique (product_id, code)
);

create table if not exists public.product_variant_translations (
  variant_id   bigint not null references public.product_variants(id) on delete cascade,
  language_id  text not null references public.languages(id) on delete cascade,
  name         text not null default '',
  description  text,
  primary key (variant_id, language_id)
);

-- Harga per varian per mata uang.
-- `price` numerik siap untuk masa depan; `price_note` menyimpan teks bebas
-- (mis. "10 pcs") selama UI masih memakai teks apa adanya.
create table if not exists public.product_variant_prices (
  id           bigserial primary key,
  variant_id   bigint not null references public.product_variants(id) on delete cascade,
  currency_id  smallint not null references public.currencies(id) on delete restrict,
  price        numeric(12, 2),
  price_note   text not null default '',
  is_active    boolean not null default true,
  valid_from   date,
  valid_until  date,
  unique (variant_id, currency_id)
);

-- Foto produk (galeri; satu primer per produk, lihat indeks di bawah).
create table if not exists public.product_images (
  id            bigserial primary key,
  product_id    bigint not null references public.products(id) on delete cascade,
  variant_id    bigint references public.product_variants(id) on delete cascade,
  storage_path  text not null,
  alt_text      text,
  sort_order    integer not null default 0,
  is_primary    boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Keanggotaan admin di database (sumber kebenaran hak akses; bukan env var).
create table if not exists public.admin_users (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- Indeks bantu.
create index if not exists products_status_idx on public.products (status);
create index if not exists products_sort_order_idx on public.products (sort_order);
create index if not exists product_translations_language_idx on public.product_translations (language_id);
create index if not exists product_categories_category_idx on public.product_categories (category_id);
create index if not exists product_variants_product_idx on public.product_variants (product_id);
create index if not exists product_variant_prices_variant_idx on public.product_variant_prices (variant_id);
create index if not exists product_images_product_idx on public.product_images (product_id);
create unique index if not exists product_images_primary_idx
  on public.product_images (product_id) where is_primary and variant_id is null;

-- Nama master unik per bahasa Indonesia: dasar pencocokan "cari atau buat"
-- pada fungsi simpan produk.
create unique index if not exists material_translations_id_name_idx
  on public.material_translations (name) where language_id = 'id';
create unique index if not exists finishing_translations_id_name_idx
  on public.finishing_translations (name) where language_id = 'id';
create unique index if not exists category_translations_id_name_idx
  on public.category_translations (name) where language_id = 'id';


-- ============================================================================
-- 002 - Seed bahasa, mata uang, dan data rujukan (kategori/usia/material/finishing).
-- ============================================================================
-- Nilai teks diambil dari data lama (3 bahasa). Aman dijalankan ulang.
-- ============================================================================


-- Bahasa & arah teks.
insert into public.languages (id, name, direction, sort_order, is_active) values
  ('id', 'Bahasa Indonesia', 'ltr', 1, true),
  ('en', 'English', 'ltr', 2, true),
  ('ar', 'العربية', 'rtl', 3, true)
on conflict (id) do update set
  name = excluded.name, direction = excluded.direction,
  sort_order = excluded.sort_order, is_active = excluded.is_active;

-- Mata uang.
insert into public.currencies (code, symbol, name, is_active) values
  ('USD', '$', 'US Dollar', true),
  ('IDR', 'Rp', 'Rupiah', true)
on conflict (code) do update set
  symbol = excluded.symbol, name = excluded.name, is_active = excluded.is_active;

-- Kategori.
insert into public.categories (slug, sort_order, is_active) values
  ('main-sambil-belajar', 1, true),
  ('gerak-jelajah', 2, true),
  ('teman-tumbuh', 3, true)
on conflict (slug) do update set
  sort_order = excluded.sort_order, is_active = excluded.is_active;

insert into public.category_translations (category_id, language_id, name)
select c.id, v.language_id, v.name
from (values
  ('main-sambil-belajar', 'id', 'Main sambil belajar'),
  ('main-sambil-belajar', 'en', 'Learn through play'),
  ('main-sambil-belajar', 'ar', 'التعلّم باللعب'),
  ('gerak-jelajah', 'id', 'Gerak & jelajah'),
  ('gerak-jelajah', 'en', 'Move & explore'),
  ('gerak-jelajah', 'ar', 'الحركة والاستكشاف'),
  ('teman-tumbuh', 'id', 'Teman tumbuh'),
  ('teman-tumbuh', 'en', 'Growing companions'),
  ('teman-tumbuh', 'ar', 'رفيق النمو')
) as v(slug, language_id, name)
join public.categories c on c.slug = v.slug
on conflict (category_id, language_id) do update set name = excluded.name;

-- Rentang usia (dalam bulan).
insert into public.age_ranges (min_months, max_months, sort_order) values
  (12, 36, 1),
  (12, 48, 2),
  (12, 60, 3),
  (24, 60, 4),
  (36, 72, 5)
on conflict (min_months, max_months) do update set sort_order = excluded.sort_order;

-- Material.
insert into public.materials (code, sort_order, is_active) values
  ('kayu-pinus-solid', 1, true),
  ('kayu-karet-solid', 2, true),
  ('kayu-birch-lapis', 3, true),
  ('kayu-pinus-solid-bilah-logam', 4, true)
on conflict (code) do update set
  sort_order = excluded.sort_order, is_active = excluded.is_active;

insert into public.material_translations (material_id, language_id, name)
select m.id, v.language_id, v.name
from (values
  ('kayu-pinus-solid', 'id', 'Kayu pinus solid'),
  ('kayu-pinus-solid', 'en', 'Solid pine wood'),
  ('kayu-pinus-solid', 'ar', 'خشب صنوبر صلب'),
  ('kayu-karet-solid', 'id', 'Kayu karet solid'),
  ('kayu-karet-solid', 'en', 'Solid rubberwood'),
  ('kayu-karet-solid', 'ar', 'خشب مطاط صلب'),
  ('kayu-birch-lapis', 'id', 'Kayu birch lapis'),
  ('kayu-birch-lapis', 'en', 'Plywood birch'),
  ('kayu-birch-lapis', 'ar', 'خشب بتولا رقائقي'),
  ('kayu-pinus-solid-bilah-logam', 'id', 'Kayu pinus solid dengan bilah logam'),
  ('kayu-pinus-solid-bilah-logam', 'en', 'Solid pine wood with metal bars'),
  ('kayu-pinus-solid-bilah-logam', 'ar', 'خشب صنوبر صلب مع قضبان معدنية')
) as v(code, language_id, name)
join public.materials m on m.code = v.code
on conflict (material_id, language_id) do update set name = excluded.name;

-- Finishing.
insert into public.finishings (code, sort_order, is_active) values
  ('cat-air-matte', 1, true)
on conflict (code) do update set
  sort_order = excluded.sort_order, is_active = excluded.is_active;

insert into public.finishing_translations (finishing_id, language_id, name)
select f.id, v.language_id, v.name
from (values
  ('cat-air-matte', 'id', 'Cat berbasis air, lapisan matte'),
  ('cat-air-matte', 'en', 'Water-based paint, matte finish'),
  ('cat-air-matte', 'ar', 'طلاء مائي بتشطيب مطفي')
) as v(code, language_id, name)
join public.finishings f on f.code = v.code
on conflict (finishing_id, language_id) do update set name = excluded.name;


-- ============================================================================
-- 003 - Seed katalog: 8 produk lama + relasinya (dihasilkan otomatis).
-- ============================================================================

-- Produk (data non-bahasa).
insert into public.products (id, slug, status, sort_order, surface, accent, illustration, material_id, finishing_id)
select v.id, v.slug, 'published', v.sort_order, v.surface, v.accent, v.illustration, m.id, f.id
from (values
  (1, 'stacking-rainbow', 1, '#F9E2BE', '#D88653', 'rainbow', 'kayu-pinus-solid', 'cat-air-matte'),
  (2, 'kiko-little-car', 2, '#DCE9DD', '#6F9275', 'car', 'kayu-karet-solid', 'cat-air-matte'),
  (3, 'story-blocks', 3, '#F6D9CB', '#C56E4C', 'blocks', 'kayu-pinus-solid', 'cat-air-matte'),
  (4, 'morning-garden-puzzle', 4, '#DDE7F0', '#5E88A1', 'puzzle', 'kayu-birch-lapis', 'cat-air-matte'),
  (5, 'number-tower', 5, '#F3E3C8', '#C98A3B', 'blocks', 'kayu-pinus-solid', 'cat-air-matte'),
  (6, 'dodo-pull-duck', 6, '#E4EDE2', '#6E9A6A', 'car', 'kayu-karet-solid', 'cat-air-matte'),
  (7, 'melody-xylophone', 7, '#F1DDE0', '#B76B78', 'blocks', 'kayu-pinus-solid-bilah-logam', 'cat-air-matte'),
  (8, 'time-wooden-clock', 8, '#E1E8EA', '#5E7F8A', 'puzzle', 'kayu-birch-lapis', 'cat-air-matte')
) as v(id, slug, sort_order, surface, accent, illustration, material_code, finishing_code)
join public.materials m on m.code = v.material_code
join public.finishings f on f.code = v.finishing_code
on conflict (id) do update set
  slug = excluded.slug, status = excluded.status, sort_order = excluded.sort_order,
  surface = excluded.surface, accent = excluded.accent, illustration = excluded.illustration,
  material_id = excluded.material_id, finishing_id = excluded.finishing_id, updated_at = now();

-- Terjemahan produk (3 bahasa).
insert into public.product_translations (product_id, language_id, name, description, dimensions, contents, care)
values
  (1, 'id', 'Pelangi Susun', 'Enam lengkung lembut yang bisa disusun menjadi jembatan, rumah, atau dunia kecil versi mereka.', '28 × 14 × 5 cm', '6 lengkung kayu', 'Lap dengan kain lembap, lalu keringkan. Hindari direndam.'),
  (1, 'en', 'Stacking Rainbow', 'Six gentle arches that become a bridge, a house, or a little world of their own.', '28 × 14 × 5 cm', '6 wooden arches', 'Wipe with a damp cloth, then dry. Do not soak.'),
  (1, 'ar', 'قوس قزح قابل للتركيب', 'ستة أقواس ناعمة يمكن ترتيبها لتصبح جسراً أو بيتاً أو عالماً صغيراً خاصاً بهم.', '٢٨ × ١٤ × ٥ سم', '٦ أقواس خشبية', 'يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء.'),
  (2, 'id', 'Mobil Kecil Kiko', 'Mobil kecil beroda bebas untuk perjalanan mengelilingi ruang keluarga dan cerita yang terus bergerak.', '16 × 10 × 8 cm', '1 mobil kayu', 'Lap dengan kain lembap, lalu keringkan. Hindari direndam.'),
  (2, 'en', 'Kiko Little Car', 'A little free-rolling car for trips around the living room and stories that keep moving.', '16 × 10 × 8 cm', '1 wooden car', 'Wipe with a damp cloth, then dry. Do not soak.'),
  (2, 'ar', 'سيارة كيكو الصغيرة', 'سيارة صغيرة بعجلات حرة لرحلات حول غرفة المعيشة وحكايات لا تتوقف عن الحركة.', '١٦ × ١٠ × ٨ سم', 'سيارة خشبية واحدة', 'يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء.'),
  (3, 'id', 'Balok Cerita', 'Sekumpulan bentuk sederhana untuk menara yang tinggi, kota imajiner, dan percakapan tanpa aturan.', 'Kotak penyimpanan 25 × 18 × 7 cm', '24 balok dengan 6 bentuk', 'Lap dengan kain lembap, lalu keringkan. Simpan dalam keadaan kering.'),
  (3, 'en', 'Story Blocks', 'A collection of simple shapes for tall towers, imaginary cities, and conversations without rules.', 'Storage box 25 × 18 × 7 cm', '24 blocks in 6 shapes', 'Wipe with a damp cloth, then dry. Store dry.'),
  (3, 'ar', 'مكعبات الحكايات', 'مجموعة من الأشكال البسيطة للأبراج العالية والمدن الخيالية والحوارات بلا قواعد.', 'صندوق حفظ ٢٥ × ١٨ × ٧ سم', '٢٤ مكعباً بـ٦ أشكال', 'يُمسح بقطعة قماش مبللة ثم يُجفف. يُحفظ جافاً.'),
  (4, 'id', 'Puzzle Kebun Pagi', 'Potongan berwarna lembut yang mengajak tangan kecil mengenali bentuk sambil menyusun suasana pagi.', '22 × 22 × 1,2 cm', '1 papan puzzle, 6 keping', 'Lap dengan kain lembap, lalu keringkan. Hindari paparan air berlebih.'),
  (4, 'en', 'Morning Garden Puzzle', 'Softly coloured pieces that invite little hands to recognise shapes while arranging a morning scene.', '22 × 22 × 1.2 cm', '1 puzzle board, 6 pieces', 'Wipe with a damp cloth, then dry. Avoid excess water.'),
  (4, 'ar', 'أحجية حديقة الصباح', 'قطع بألوان هادئة تدعو الأيدي الصغيرة إلى تمييز الأشكال أثناء ترتيب مشهد صباحي.', '٢٢ × ٢٢ × ١٫٢ سم', 'لوح أحجية واحد و٦ قطع', 'يُمسح بقطعة قماش مبللة ثم يُجفف. تجنب الماء الزائد.'),
  (5, 'id', 'Menara Angka', 'Enam gelang warna yang disusun dari besar ke kecil, dengan angka terukir di setiap tingkatnya.', '12 × 12 × 21 cm', '6 gelang kayu dan 1 tiang', 'Lap dengan kain lembap, lalu keringkan. Hindari direndam.'),
  (5, 'en', 'Number Tower', 'Six coloured rings stacked from large to small, with a number carved into every level.', '12 × 12 × 21 cm', '6 wooden rings and 1 post', 'Wipe with a damp cloth, then dry. Do not soak.'),
  (5, 'ar', 'برج الأرقام', 'ست حلقات ملوّنة تُرتّب من الأكبر إلى الأصغر، مع رقم محفور على كل مستوى.', '١٢ × ١٢ × ٢١ سم', '٦ حلقات خشبية وعمود واحد', 'يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء.'),
  (6, 'id', 'Bebek Tarik Dodo', 'Bebek kayu bertali yang mengikuti langkah kecil, rodanya berputar dan kepalanya bergoyang.', '20 × 9 × 13 cm, tali 50 cm', '1 bebek tarik dengan tali', 'Lap dengan kain lembap, lalu keringkan. Hindari direndam.'),
  (6, 'en', 'Dodo Pull Duck', 'A stringed wooden duck that follows little footsteps, wheels turning and head bobbing.', '20 × 9 × 13 cm, 50 cm string', '1 pull duck with string', 'Wipe with a damp cloth, then dry. Do not soak.'),
  (6, 'ar', 'بطة الجر دودو', 'بطة خشبية بحبل تتبع الخطوات الصغيرة، تدور عجلاتها ويتمايل رأسها.', '٢٠ × ٩ × ١٣ سم، حبل ٥٠ سم', 'بطة جر واحدة مع حبل', 'يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء.'),
  (7, 'id', 'Xilofon Melodi', 'Delapan bilah nada di atas badan kayu, cukup keras untuk tangan kecil dan cukup lembut untuk rumah yang tenang.', '26 × 15 × 4 cm', '1 xilofon dan 2 pemukul kayu', 'Lap dengan kain lembap, lalu keringkan. Hindari direndam.'),
  (7, 'en', 'Melody Xylophone', 'Eight note bars on a wooden body, loud enough for small hands and gentle enough for a quiet house.', '26 × 15 × 4 cm', '1 xylophone and 2 wooden mallets', 'Wipe with a damp cloth, then dry. Do not soak.'),
  (7, 'ar', 'زيلوفون الألحان', 'ثمانية قضبان نغمية على جسم خشبي، عالية بما يكفي للأيدي الصغيرة وهادئة بما يكفي للبيت.', '٢٦ × ١٥ × ٤ سم', 'زيلوفون واحد ومطرقتان خشبيتان', 'يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء.'),
  (8, 'id', 'Jam Kayu Waktu', 'Papan jam dengan dua jarum yang bisa diputar sendiri, untuk mengenal angka dan urutan hari.', '24 × 24 × 2,4 cm', '1 papan jam dengan 2 jarum', 'Lap dengan kain lembap, lalu keringkan. Hindari direndam.'),
  (8, 'en', 'Time Wooden Clock', 'A clock board with two hands a child can turn by hand, for learning numbers and the shape of a day.', '24 × 24 × 2.4 cm', '1 clock board with 2 hands', 'Wipe with a damp cloth, then dry. Do not soak.'),
  (8, 'ar', 'ساعة الوقت الخشبية', 'لوح ساعة بعقربين يمكن للطفل تدويرهما بيده، للتعرّف على الأرقام وتسلسل اليوم.', '٢٤ × ٢٤ × ٢٫٤ سم', 'لوح ساعة واحد بعقربين', 'يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء.')
on conflict (product_id, language_id) do update set
  name = excluded.name, description = excluded.description, dimensions = excluded.dimensions,
  contents = excluded.contents, care = excluded.care;

-- Kaitan produk <-> kategori.
delete from public.product_categories where product_id between 1 and 8;
insert into public.product_categories (product_id, category_id, is_primary)
select v.product_id, c.id, true
from (values
  (1, 'main-sambil-belajar'),
  (2, 'gerak-jelajah'),
  (3, 'main-sambil-belajar'),
  (4, 'teman-tumbuh'),
  (5, 'main-sambil-belajar'),
  (6, 'gerak-jelajah'),
  (7, 'main-sambil-belajar'),
  (8, 'teman-tumbuh')
) as v(product_id, category_slug)
join public.categories c on c.slug = v.category_slug;

-- Kaitan produk <-> rentang usia.
delete from public.product_age_ranges where product_id between 1 and 8;
insert into public.product_age_ranges (product_id, age_range_id)
select v.product_id, a.id
from (values
  (1, 12, 48),
  (2, 24, 60),
  (3, 12, 60),
  (4, 36, 72),
  (5, 12, 36),
  (6, 12, 36),
  (7, 24, 60),
  (8, 36, 72)
) as v(product_id, min_months, max_months)
join public.age_ranges a on a.min_months = v.min_months and a.max_months = v.max_months;

-- Foto utama tiap produk (berkas lama di public/images tetap dipakai).
delete from public.product_images where product_id between 1 and 8 and variant_id is null;
insert into public.product_images (product_id, storage_path, sort_order, is_primary) values
  (1, '/images/products/pelangi-susun.jpeg', 0, true),
  (2, '/images/products/mobil-kecil-kiko.jpeg', 0, true),
  (3, '/images/products/balok-cerita.jpeg', 0, true),
  (4, '/images/products/puzzle-kebun-pagi.jpeg', 0, true),
  (5, '/images/products/menara-angka.jpeg', 0, true),
  (6, '/images/products/bebek-tarik-dodo.jpeg', 0, true),
  (7, '/images/products/xilofon-melodi.jpeg', 0, true),
  (8, '/images/products/jam-kayu-waktu.jpeg', 0, true);


-- ============================================================================
-- 004 - Keamanan & fungsi: RLS semua tabel, helper, RPC admin, bootstrap admin.
-- ============================================================================
-- Prinsip:
--   * anon (pengunjung) hanya bisa MEMBACA data yang memang tampil di situs;
--   * hanya anggota public.admin_users (via is_admin()) yang bisa menulis;
--   * tidak ada satu pun policy `USING (true)` untuk data admin.
-- Aman dijalankan ulang (idempotent).
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Fungsi bantu (SECURITY DEFINER supaya tidak rekursi ke RLS tabelnya sendiri).
-- ----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1 from public.admin_users a where a.user_id = auth.uid()
  );
$fn$;

create or replace function public.is_published_product(p_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1 from public.products p where p.id = p_id and p.status = 'published'
  );
$fn$;

create or replace function public.is_public_variant(v_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1
    from public.product_variants v
    join public.products p on p.id = v.product_id
    where v.id = v_id and v.is_active and p.status = 'published'
  );
$fn$;

-- ----------------------------------------------------------------------------
-- Aktifkan RLS di semua tabel.
-- ----------------------------------------------------------------------------

alter table public.languages                  enable row level security;
alter table public.currencies                 enable row level security;
alter table public.categories                 enable row level security;
alter table public.category_translations      enable row level security;
alter table public.age_ranges                 enable row level security;
alter table public.materials                  enable row level security;
alter table public.material_translations      enable row level security;
alter table public.finishings                 enable row level security;
alter table public.finishing_translations     enable row level security;
alter table public.products                   enable row level security;
alter table public.product_translations       enable row level security;
alter table public.product_categories         enable row level security;
alter table public.product_age_ranges         enable row level security;
alter table public.product_variants           enable row level security;
alter table public.product_variant_translations enable row level security;
alter table public.product_variant_prices     enable row level security;
alter table public.product_images             enable row level security;
alter table public.admin_users                enable row level security;

-- ----------------------------------------------------------------------------
-- Policy: data rujukan (baca publik; kelola admin).
-- ----------------------------------------------------------------------------

drop policy if exists "languages baca" on public.languages;
create policy "languages baca" on public.languages for select using (is_active);
drop policy if exists "languages admin" on public.languages;
create policy "languages admin" on public.languages for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "currencies baca" on public.currencies;
create policy "currencies baca" on public.currencies for select using (is_active);
drop policy if exists "currencies admin" on public.currencies;
create policy "currencies admin" on public.currencies for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "categories baca" on public.categories;
create policy "categories baca" on public.categories for select using (is_active);
drop policy if exists "categories admin" on public.categories;
create policy "categories admin" on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "category_translations baca" on public.category_translations;
create policy "category_translations baca" on public.category_translations for select
  using (exists (select 1 from public.categories c where c.id = category_id and c.is_active));
drop policy if exists "category_translations admin" on public.category_translations;
create policy "category_translations admin" on public.category_translations for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "age_ranges baca" on public.age_ranges;
create policy "age_ranges baca" on public.age_ranges for select using (true);
drop policy if exists "age_ranges admin" on public.age_ranges;
create policy "age_ranges admin" on public.age_ranges for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "materials baca" on public.materials;
create policy "materials baca" on public.materials for select using (is_active);
drop policy if exists "materials admin" on public.materials;
create policy "materials admin" on public.materials for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "material_translations baca" on public.material_translations;
create policy "material_translations baca" on public.material_translations for select
  using (exists (select 1 from public.materials m where m.id = material_id and m.is_active));
drop policy if exists "material_translations admin" on public.material_translations;
create policy "material_translations admin" on public.material_translations for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "finishings baca" on public.finishings;
create policy "finishings baca" on public.finishings for select using (is_active);
drop policy if exists "finishings admin" on public.finishings;
create policy "finishings admin" on public.finishings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "finishing_translations baca" on public.finishing_translations;
create policy "finishing_translations baca" on public.finishing_translations for select
  using (exists (select 1 from public.finishings f where f.id = finishing_id and f.is_active));
drop policy if exists "finishing_translations admin" on public.finishing_translations;
create policy "finishing_translations admin" on public.finishing_translations for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- Policy: produk & tabel anaknya.
-- ----------------------------------------------------------------------------

drop policy if exists "products baca terbit" on public.products;
create policy "products baca terbit" on public.products for select using (status = 'published');
drop policy if exists "products admin" on public.products;
create policy "products admin" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_translations baca" on public.product_translations;
create policy "product_translations baca" on public.product_translations for select
  using (public.is_published_product(product_id));
drop policy if exists "product_translations admin" on public.product_translations;
create policy "product_translations admin" on public.product_translations for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_categories baca" on public.product_categories;
create policy "product_categories baca" on public.product_categories for select
  using (public.is_published_product(product_id));
drop policy if exists "product_categories admin" on public.product_categories;
create policy "product_categories admin" on public.product_categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_age_ranges baca" on public.product_age_ranges;
create policy "product_age_ranges baca" on public.product_age_ranges for select
  using (public.is_published_product(product_id));
drop policy if exists "product_age_ranges admin" on public.product_age_ranges;
create policy "product_age_ranges admin" on public.product_age_ranges for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_variants baca" on public.product_variants;
create policy "product_variants baca" on public.product_variants for select
  using (is_active and public.is_published_product(product_id));
drop policy if exists "product_variants admin" on public.product_variants;
create policy "product_variants admin" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_variant_translations baca" on public.product_variant_translations;
create policy "product_variant_translations baca" on public.product_variant_translations for select
  using (public.is_public_variant(variant_id));
drop policy if exists "product_variant_translations admin" on public.product_variant_translations;
create policy "product_variant_translations admin" on public.product_variant_translations for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_variant_prices baca" on public.product_variant_prices;
create policy "product_variant_prices baca" on public.product_variant_prices for select
  using (is_active and public.is_public_variant(variant_id));
drop policy if exists "product_variant_prices admin" on public.product_variant_prices;
create policy "product_variant_prices admin" on public.product_variant_prices for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_images baca" on public.product_images;
create policy "product_images baca" on public.product_images for select
  using (public.is_published_product(product_id));
drop policy if exists "product_images admin" on public.product_images;
create policy "product_images admin" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- Policy: daftar admin.
-- ----------------------------------------------------------------------------

drop policy if exists "admin_users baca sendiri" on public.admin_users;
create policy "admin_users baca sendiri" on public.admin_users for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists "admin_users kelola" on public.admin_users;
create policy "admin_users kelola" on public.admin_users for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- Bootstrap admin: email pemilik otomatis masuk daftar admin.
-- ----------------------------------------------------------------------------

create or replace function public.bootstrap_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if lower(new.email) = 'alpianrezha@gmail.com' then
    insert into public.admin_users (user_id) values (new.id)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$fn$;

drop trigger if exists trg_bootstrap_admin on auth.users;
create trigger trg_bootstrap_admin
  after insert on auth.users
  for each row execute function public.bootstrap_admin();

-- Akun yang sudah ada sebelum trigger dipasang (mis. dibuat duluan).
insert into public.admin_users (user_id)
select u.id from auth.users u where lower(u.email) = 'alpianrezha@gmail.com'
on conflict (user_id) do nothing;

-- ----------------------------------------------------------------------------
-- RPC admin: operasi tulis dipusatkan di fungsi database (atomik, satu transaksi).
-- ----------------------------------------------------------------------------

-- Ubah teks apa pun menjadi slug kecil (a-z, 0-9, tanda hubung).
create or replace function public.slugify_text(p_text text)
returns text
language sql
immutable
as $fn$
  select coalesce(
    nullif(
      trim(both '-' from regexp_replace(lower(coalesce(p_text, '')), '[^a-z0-9]+', '-', 'g')),
      ''
    ),
    ''
  );
$fn$;

-- Slug unik untuk baris master yang dibuat dari teks bebas admin.
create or replace function public.unique_slug(p_base text)
returns text
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_slug text;
  v_n int := 0;
begin
  v_slug := coalesce(nullif(public.slugify_text(p_base), ''), 'item');
  loop
    exit when not exists (select 1 from public.categories where slug = v_slug)
      and not exists (select 1 from public.materials where code = v_slug)
      and not exists (select 1 from public.finishings where code = v_slug);
    v_n := v_n + 1;
    if v_n > 50 then exit; end if;
    v_slug := coalesce(nullif(public.slugify_text(p_base), ''), 'item') || '-' || v_n::text;
  end loop;
  return v_slug;
end;
$fn$;

-- Simpan (buat/ganti) satu produk lengkap dari payload formulir admin.
create or replace function public.upsert_product(payload jsonb)
returns bigint
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_id bigint := (payload->>'id')::bigint;
  v_text text;
  v_material_id bigint;
  v_finishing_id bigint;
  v_category_id bigint;
  v_age_id bigint;
  v_min int;
  v_max int;
  v_nums int[];
  v_len int;
  v_i int;
  v_label text;
  v_code text;
  v_price text;
  v_variant_id bigint;
  v_used text[] := '{}';
  v_images jsonb;
  v_img_len int;
  v_item jsonb;
  v_path text;
  v_alt text;
  v_order int;
  v_primary boolean;
  v_has_requested_primary boolean := false;
  v_is_primary_set boolean := false;
begin
  if not public.is_admin() then
    raise exception 'Akses menyimpan ditolak.';
  end if;

  -- 1. Baris produk.
  insert into public.products (id, slug, status, sort_order, surface, accent, illustration, updated_at)
  values (
    v_id,
    coalesce(nullif(trim(payload->>'slug'), ''), v_id::text),
    coalesce(nullif(payload->>'status', ''), 'draft'),
    coalesce((payload->>'order')::int, 0),
    payload->>'surface',
    payload->>'accent',
    payload->>'illustration',
    now()
  )
  on conflict (id) do update set
    slug = excluded.slug,
    status = excluded.status,
    sort_order = excluded.sort_order,
    surface = excluded.surface,
    accent = excluded.accent,
    illustration = excluded.illustration,
    updated_at = now();

  -- 2. Material (cari berdasarkan teks bahasa Indonesia; buat kalau belum ada).
  v_text := trim(coalesce(payload->'translations'->'id'->>'wood', ''));
  if v_text <> '' then
    select mt.material_id into v_material_id
    from public.material_translations mt
    where mt.language_id = 'id' and mt.name = v_text
    limit 1;

    if v_material_id is null then
      insert into public.materials (code, sort_order)
      values (public.unique_slug(v_text), 99)
      returning id into v_material_id;
    end if;

    insert into public.material_translations (material_id, language_id, name) values
      (v_material_id, 'id', v_text),
      (v_material_id, 'en', coalesce(payload->'translations'->'en'->>'wood', '')),
      (v_material_id, 'ar', coalesce(payload->'translations'->'ar'->>'wood', ''))
    on conflict (material_id, language_id) do update set name = excluded.name;
  else
    v_material_id := null;
  end if;
  update public.products set material_id = v_material_id where id = v_id;

  -- 3. Finishing (pola sama).
  v_text := trim(coalesce(payload->'translations'->'id'->>'finish', ''));
  if v_text <> '' then
    select ft.finishing_id into v_finishing_id
    from public.finishing_translations ft
    where ft.language_id = 'id' and ft.name = v_text
    limit 1;

    if v_finishing_id is null then
      insert into public.finishings (code, sort_order)
      values (public.unique_slug(v_text), 99)
      returning id into v_finishing_id;
    end if;

    insert into public.finishing_translations (finishing_id, language_id, name) values
      (v_finishing_id, 'id', v_text),
      (v_finishing_id, 'en', coalesce(payload->'translations'->'en'->>'finish', '')),
      (v_finishing_id, 'ar', coalesce(payload->'translations'->'ar'->>'finish', ''))
    on conflict (finishing_id, language_id) do update set name = excluded.name;
  else
    v_finishing_id := null;
  end if;
  update public.products set finishing_id = v_finishing_id where id = v_id;

  -- 4. Kategori (pola sama; satu kategori utama per produk untuk sekarang).
  v_text := trim(coalesce(payload->'translations'->'id'->>'category', ''));
  delete from public.product_categories where product_id = v_id;
  if v_text <> '' then
    select ct.category_id into v_category_id
    from public.category_translations ct
    where ct.language_id = 'id' and ct.name = v_text
    limit 1;

    if v_category_id is null then
      insert into public.categories (slug, sort_order)
      values (public.unique_slug(v_text), 99)
      returning id into v_category_id;
    end if;

    insert into public.category_translations (category_id, language_id, name) values
      (v_category_id, 'id', v_text),
      (v_category_id, 'en', coalesce(payload->'translations'->'en'->>'category', '')),
      (v_category_id, 'ar', coalesce(payload->'translations'->'ar'->>'category', ''))
    on conflict (category_id, language_id) do update set name = excluded.name;

    insert into public.product_categories (product_id, category_id, is_primary)
    values (v_id, v_category_id, true)
    on conflict (product_id, category_id) do update set is_primary = true;
  end if;

  -- 5. Usia: baca teks bahasa Indonesia ("1-4 tahun" / "6-18 bulan").
  v_text := trim(coalesce(payload->'translations'->'id'->>'age', ''));
  delete from public.product_age_ranges where product_id = v_id;
  if v_text <> '' then
    select array_agg(x::int) into v_nums
    from regexp_split_to_table(v_text, '[^0-9]+') as x
    where x <> '';
    if coalesce(array_length(v_nums, 1), 0) = 0 then
      raise exception 'Umur produk harus ditulis seperti "1-4 tahun" atau "6-18 bulan".';
    elsif array_length(v_nums, 1) = 1 then
      v_min := v_nums[1];
      v_max := v_nums[1];
    else
      v_min := least(v_nums[1], v_nums[2]);
      v_max := greatest(v_nums[1], v_nums[2]);
    end if;

    if lower(v_text) like '%bulan%' or lower(v_text) like '%month%' then
      null; -- sudah dalam bulan
    elsif lower(v_text) like '%tahun%' or lower(v_text) like '%year%' then
      v_min := v_min * 12;
      v_max := v_max * 12;
    else
      raise exception 'Umur produk harus ditulis seperti "1-4 tahun" atau "6-18 bulan".';
    end if;

    select a.id into v_age_id from public.age_ranges a
    where a.min_months = v_min and a.max_months = v_max
    limit 1;

    if v_age_id is null then
      insert into public.age_ranges (min_months, max_months, sort_order)
      values (v_min, v_max, 100 + v_min)
      returning id into v_age_id;
    end if;

    insert into public.product_age_ranges (product_id, age_range_id)
    values (v_id, v_age_id)
    on conflict (product_id, age_range_id) do nothing;
  end if;

  -- 6. Teks produk per bahasa.
  insert into public.product_translations
    (product_id, language_id, name, description, dimensions, contents, care)
  select
    v_id,
    l.id,
    coalesce(payload->'translations'->l.id->>'name', ''),
    coalesce(payload->'translations'->l.id->>'description', ''),
    coalesce(payload->'translations'->l.id->>'dimensions', ''),
    coalesce(payload->'translations'->l.id->>'contents', ''),
    coalesce(payload->'translations'->l.id->>'care', '')
  from public.languages l
  where l.is_active
  on conflict (product_id, language_id) do update set
    name = excluded.name,
    description = excluded.description,
    dimensions = excluded.dimensions,
    contents = excluded.contents,
    care = excluded.care;

  -- 7. Galeri foto.
  --    Payload baru: payload->'images' = array [{ imageUrl, imagePath?,
  --    sortOrder, isPrimary }]. Path Storage dipakai dari imagePath (hasil
  --    unggahan aplikasi), fallback ke imageUrl (boleh URL luar / folder
  --    public). Tabel disinkronkan ulang: semua baris lama dihapus, lalu
  --    dipasangi ulang mengikuti array - baris yang dihapus juga berarti
  --    admin sengaja melepasnya. Satu gambar utama per produk tetap
  --    dijamin: indeks unik parsial (product_images_primary_idx) melarang
  --    lebih dari satu, dan jika array tidak menandai satu pun isPrimary,
  --    gambar pertama yang jadi utama.
  --    Payload lama (tanpa images): perilaku lama - satu gambar utama dari
  --    imagePath/imageUrl.
  v_images := payload->'images';
  v_img_len := coalesce(jsonb_array_length(coalesce(v_images, '[]'::jsonb)), 0);

  delete from public.product_images where product_id = v_id and variant_id is null;

  if v_img_len > 0 then
    select exists (
      select 1
      from jsonb_array_elements(v_images) as image_item
      where coalesce((image_item->>'isPrimary')::boolean, false)
        and coalesce(nullif(trim(coalesce(image_item->>'imagePath', '')), ''), nullif(trim(coalesce(image_item->>'imageUrl', '')), '')) is not null
    ) into v_has_requested_primary;

    for v_i in 0 .. v_img_len - 1 loop
      v_item := v_images->v_i;
      if jsonb_typeof(v_item) <> 'object' then
        continue;
      end if;

      v_path := nullif(trim(coalesce(v_item->>'imagePath', '')), '');
      if v_path is null then
        v_path := nullif(trim(coalesce(v_item->>'imageUrl', '')), '');
      end if;
      if v_path is null then
        continue;
      end if;

      v_alt := nullif(trim(coalesce(v_item->>'altText', '')), '');
      v_order := coalesce((v_item->>'sortOrder')::int, v_i);
      v_primary := false;
      if v_has_requested_primary then
        v_primary := coalesce((v_item->>'isPrimary')::boolean, false) and not v_is_primary_set;
      elsif not v_is_primary_set then
        v_primary := true; -- gambar valid pertama jadi utama bila tak ada penanda
      end if;

      insert into public.product_images
        (product_id, storage_path, alt_text, sort_order, is_primary)
      values (v_id, v_path, v_alt, v_order, v_primary);
      if v_primary then
        v_is_primary_set := true;
      end if;
    end loop;
  else
    v_text := nullif(trim(coalesce(payload->>'imagePath', '')), '');
    if v_text is null then
      v_text := nullif(trim(coalesce(payload->>'imageUrl', '')), '');
    end if;
    if v_text is not null then
      insert into public.product_images (product_id, storage_path, sort_order, is_primary)
      values (v_id, v_text, 0, true);
    end if;
  end if;

  -- 8. Varian + nama + harga teks.
  v_len := coalesce(jsonb_array_length(coalesce(payload->'variants', '[]'::jsonb)), 0);
  if v_len > 0 then
    for v_i in 0 .. v_len - 1 loop
      v_label := trim(coalesce(payload->'variants'->v_i->>'label', ''));
      continue when v_label = '';

      v_code := coalesce(nullif(public.slugify_text(v_label), ''), 'varian-' || (v_i + 1)::text);

      insert into public.product_variants (product_id, code, sort_order, is_default, is_active)
      values (v_id, v_code, v_i, v_i = 0, true)
      on conflict (product_id, code) do update set
        sort_order = excluded.sort_order,
        is_default = excluded.is_default,
        is_active = true
      returning id into v_variant_id;

      insert into public.product_variant_translations (variant_id, language_id, name)
      select v_variant_id, l.id, v_label
      from public.languages l
      where l.is_active
      on conflict (variant_id, language_id) do update set name = excluded.name;

      v_price := trim(coalesce(payload->'variants'->v_i->>'price', ''));
      if v_price <> '' then
        insert into public.product_variant_prices (variant_id, currency_id, price, price_note, is_active)
        select v_variant_id, c.id, null, v_price, true
        from public.currencies c
        where c.code = 'USD'
        on conflict (variant_id, currency_id) do update set
          price_note = excluded.price_note,
          is_active = true;
      else
        delete from public.product_variant_prices where variant_id = v_variant_id;
      end if;

      v_used := v_used || v_code;
    end loop;
  end if;

  -- Buang varian yang tidak ada lagi di formulir.
  delete from public.product_variants
  where product_id = v_id and not (code = any (v_used));

  return v_id;
end;
$fn$;

-- Hapus satu produk (seluruh baris anak ikut terhapus lewat cascade).
create or replace function public.delete_product(p_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if not public.is_admin() then
    raise exception 'Akses menghapus ditolak.';
  end if;
  delete from public.products where id = p_id;
end;
$fn$;

-- Tukar urutan dua produk dalam satu transaksi.
create or replace function public.swap_product_order(p_first bigint, p_second bigint)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_first int;
  v_second int;
begin
  if not public.is_admin() then
    raise exception 'Akses mengubah urutan ditolak.';
  end if;

  select sort_order into v_first from public.products where id = p_first;
  select sort_order into v_second from public.products where id = p_second;

  if v_first is null or v_second is null then
    raise exception 'Produk tidak ditemukan.';
  end if;

  update public.products set sort_order = v_second where id = p_first;
  update public.products set sort_order = v_first where id = p_second;
end;
$fn$;

-- Hanya pengguna yang login (admin panel) yang boleh memanggil fungsi tulis.
revoke execute on function public.upsert_product(jsonb) from public, anon;
grant execute on function public.upsert_product(jsonb) to authenticated;
revoke execute on function public.delete_product(bigint) from public, anon;
grant execute on function public.delete_product(bigint) to authenticated;
revoke execute on function public.swap_product_order(bigint, bigint) from public, anon;
grant execute on function public.swap_product_order(bigint, bigint) to authenticated;

-- Segarkan cache skema PostgREST supaya API langsung mengenal tabel baru.
notify pgrst, 'reload schema';


-- ============================================================================
-- 005 - Gudang foto (Supabase Storage, bucket "produk").
-- ============================================================================
-- Publik boleh melihat foto; hanya admin yang boleh mengunggah/mengubah/menghapus.
-- Batas unggahan: gambar saja, maksimal 5 MB (konsisten dengan MAX_PRODUCT_IMAGE_BYTES).
-- Aman dijalankan ulang (idempotent).
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('produk', 'produk', true)
on conflict (id) do update set public = true;

update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'produk';

-- Bersihkan policy versi skrip pertama (kalau ada), lalu pasang yang baru.
drop policy if exists "foto dilihat siapa saja" on storage.objects;
drop policy if exists "foto diunggah admin" on storage.objects;
drop policy if exists "foto diganti admin" on storage.objects;
drop policy if exists "foto dihapus admin" on storage.objects;

drop policy if exists "produk foto baca publik" on storage.objects;
create policy "produk foto baca publik"
  on storage.objects for select
  using (bucket_id = 'produk');

drop policy if exists "produk foto unggah admin" on storage.objects;
create policy "produk foto unggah admin"
  on storage.objects for insert
  with check (bucket_id = 'produk' and public.is_admin());

drop policy if exists "produk foto ubah admin" on storage.objects;
create policy "produk foto ubah admin"
  on storage.objects for update
  using (bucket_id = 'produk' and public.is_admin());

drop policy if exists "produk foto hapus admin" on storage.objects;
create policy "produk foto hapus admin"
  on storage.objects for delete
  using (bucket_id = 'produk' and public.is_admin());


-- ----------------------------------------------------------------------------
-- PEMERIKSAAN AKHIR
-- ----------------------------------------------------------------------------
select 'produk' as bagian, count(*)::text as jumlah from public.products
union all select 'terjemahan produk', count(*)::text from public.product_translations
union all select 'kategori', count(*)::text from public.categories
union all select 'rentang usia', count(*)::text from public.age_ranges
union all select 'material', count(*)::text from public.materials
union all select 'finishing', count(*)::text from public.finishings
union all select 'foto produk', count(*)::text from public.product_images
union all select 'varian produk', count(*)::text from public.product_variants
order by bagian;
