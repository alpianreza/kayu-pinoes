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
