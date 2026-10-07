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
