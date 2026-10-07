-- ============================================================================
-- KAYU PINOES - PEMASANGAN AWAL SUPABASE (satu kali jalan)
-- ============================================================================
-- Cara pakai:
--   1. Buka dashboard Supabase -> menu 'SQL Editor'
--   2. Tempel SELURUH isi berkas ini -> klik 'Run'
-- Aman dijalankan ulang. Isi: tabel produk, aturan akses, gudang foto,
-- dan penyalinan 8 produk lama dari Firebase.
-- ============================================================================


-- ============================================================================
-- BAGIAN 1: TABEL, ATURAN AKSES, GUDANG FOTO
-- ============================================================================

-- ============================================================================
-- Skema Supabase untuk Kayu Pinoes  (DRAF v1 - belum dijalankan di mana pun)
-- ============================================================================
-- Cara pakai: Supabase Dashboard -> SQL Editor -> tempel semua -> Run.
-- Aman dijalankan ulang (idempotent).
--
-- Catatan: email admin ditulis langsung (hard-code) karena policy Supabase
-- tidak bisa membaca variabel lingkungan. Harus sama dengan
-- NEXT_PUBLIC_ADMIN_EMAIL di setelan situs.
-- ============================================================================

create table if not exists public.products (
  id            bigint primary key,
  slug          text not null unique,
  "order"       integer not null,
  status        text not null check (status in ('draft', 'published')),
  surface       text not null check (surface ~ '^#[0-9a-fA-F]{6}$'),
  accent        text not null check (accent ~ '^#[0-9a-fA-F]{6}$'),
  illustration  text not null check (illustration in (
                  'mainan', 'rainbow', 'car', 'blocks', 'puzzle',
                  'hewan', 'boneka', 'menara', 'musik', 'jam'
                )),
  translations  jsonb not null,
  image_url     text,
  image_path    text,
  variants      jsonb not null default '[]'::jsonb,
  updated_at    timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "publik hanya baca yang tampil" on public.products;
drop policy if exists "admin bebas" on public.products;

create policy "publik hanya baca yang tampil"
  on public.products for select
  using (status = 'published');

create policy "admin bebas"
  on public.products for all
  using (auth.jwt() ->> 'email' = 'alpianrezha@gmail.com')
  with check (auth.jwt() ->> 'email' = 'alpianrezha@gmail.com');

-- ----------------------------------------------------------------------------
-- Gudang foto (Supabase Storage).
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('produk', 'produk', true)
on conflict (id) do nothing;

drop policy if exists "foto dilihat siapa saja" on storage.objects;
drop policy if exists "foto diunggah admin" on storage.objects;
drop policy if exists "foto diganti admin" on storage.objects;
drop policy if exists "foto dihapus admin" on storage.objects;

create policy "foto dilihat siapa saja"
  on storage.objects for select
  using (bucket_id = 'produk');

create policy "foto diunggah admin"
  on storage.objects for insert
  with check (bucket_id = 'produk' and auth.jwt() ->> 'email' = 'alpianrezha@gmail.com');

create policy "foto diganti admin"
  on storage.objects for update
  using (bucket_id = 'produk' and auth.jwt() ->> 'email' = 'alpianrezha@gmail.com');

create policy "foto dihapus admin"
  on storage.objects for delete
  using (bucket_id = 'produk' and auth.jwt() ->> 'email' = 'alpianrezha@gmail.com');


-- ============================================================================
-- BAGIAN 2: 8 PRODUK DARI FIREBASE
-- ============================================================================

-- Ekspor otomatis 8 produk dari Firestore (kayu-pinoes).
-- Jalankan SETELAH skema-supabase.sql. Aman diulang (upsert by id).

insert into public.products (id, slug, "order", status, surface, accent, illustration, translations, image_url, image_path, variants)
values
  (1, 'stacking-rainbow', 1, 'published', '#F9E2BE', '#D88653', 'rainbow', '{"id":{"name":"Pelangi Susun","category":"Main sambil belajar","age":"1–4 tahun","description":"Enam lengkung lembut yang bisa disusun menjadi jembatan, rumah, atau dunia kecil versi mereka.","wood":"Kayu pinus solid","dimensions":"28 × 14 × 5 cm","finish":"Cat berbasis air, lapisan matte","contents":"6 lengkung kayu","care":"Lap dengan kain lembap, lalu keringkan. Hindari direndam."},"en":{"name":"Stacking Rainbow","category":"Learn through play","age":"1–4 years","description":"Six gentle arches that become a bridge, a house, or a little world of their own.","wood":"Solid pine wood","dimensions":"28 × 14 × 5 cm","finish":"Water-based paint, matte finish","contents":"6 wooden arches","care":"Wipe with a damp cloth, then dry. Do not soak."},"ar":{"name":"قوس قزح قابل للتركيب","category":"التعلّم باللعب","age":"١–٤ سنوات","description":"ستة أقواس ناعمة يمكن ترتيبها لتصبح جسراً أو بيتاً أو عالماً صغيراً خاصاً بهم.","wood":"خشب صنوبر صلب","dimensions":"٢٨ × ١٤ × ٥ سم","finish":"طلاء مائي بتشطيب مطفي","contents":"٦ أقواس خشبية","care":"يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء."}}'::jsonb, null, null, '[]'::jsonb),
  (2, 'kiko-little-car', 2, 'published', '#DCE9DD', '#6F9275', 'car', '{"id":{"name":"Mobil Kecil Kiko","category":"Gerak & jelajah","age":"2–5 tahun","description":"Mobil kecil beroda bebas untuk perjalanan mengelilingi ruang keluarga dan cerita yang terus bergerak.","wood":"Kayu karet solid","dimensions":"16 × 10 × 8 cm","finish":"Cat berbasis air, lapisan matte","contents":"1 mobil kayu","care":"Lap dengan kain lembap, lalu keringkan. Hindari direndam."},"en":{"name":"Kiko Little Car","category":"Move & explore","age":"2–5 years","description":"A little free-rolling car for trips around the living room and stories that keep moving.","wood":"Solid rubberwood","dimensions":"16 × 10 × 8 cm","finish":"Water-based paint, matte finish","contents":"1 wooden car","care":"Wipe with a damp cloth, then dry. Do not soak."},"ar":{"name":"سيارة كيكو الصغيرة","category":"الحركة والاستكشاف","age":"٢–٥ سنوات","description":"سيارة صغيرة بعجلات حرة لرحلات حول غرفة المعيشة وحكايات لا تتوقف عن الحركة.","wood":"خشب مطاط صلب","dimensions":"١٦ × ١٠ × ٨ سم","finish":"طلاء مائي بتشطيب مطفي","contents":"سيارة خشبية واحدة","care":"يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء."}}'::jsonb, null, null, '[]'::jsonb),
  (3, 'story-blocks', 3, 'published', '#F6D9CB', '#C56E4C', 'blocks', '{"id":{"name":"Balok Cerita","category":"Main sambil belajar","age":"1–5 tahun","description":"Sekumpulan bentuk sederhana untuk menara yang tinggi, kota imajiner, dan percakapan tanpa aturan.","wood":"Kayu pinus solid","dimensions":"Kotak penyimpanan 25 × 18 × 7 cm","finish":"Cat berbasis air, lapisan matte","contents":"24 balok dengan 6 bentuk","care":"Lap dengan kain lembap, lalu keringkan. Simpan dalam keadaan kering."},"en":{"name":"Story Blocks","category":"Learn through play","age":"1–5 years","description":"A collection of simple shapes for tall towers, imaginary cities, and conversations without rules.","wood":"Solid pine wood","dimensions":"Storage box 25 × 18 × 7 cm","finish":"Water-based paint, matte finish","contents":"24 blocks in 6 shapes","care":"Wipe with a damp cloth, then dry. Store dry."},"ar":{"name":"مكعبات الحكايات","category":"التعلّم باللعب","age":"١–٥ سنوات","description":"مجموعة من الأشكال البسيطة للأبراج العالية والمدن الخيالية والحوارات بلا قواعد.","wood":"خشب صنوبر صلب","dimensions":"صندوق حفظ ٢٥ × ١٨ × ٧ سم","finish":"طلاء مائي بتشطيب مطفي","contents":"٢٤ مكعباً بـ٦ أشكال","care":"يُمسح بقطعة قماش مبللة ثم يُجفف. يُحفظ جافاً."}}'::jsonb, null, null, '[]'::jsonb),
  (4, 'morning-garden-puzzle', 4, 'published', '#DDE7F0', '#5E88A1', 'puzzle', '{"id":{"name":"Puzzle Kebun Pagi","category":"Teman tumbuh","age":"3–6 tahun","description":"Potongan berwarna lembut yang mengajak tangan kecil mengenali bentuk sambil menyusun suasana pagi.","wood":"Kayu birch lapis","dimensions":"22 × 22 × 1,2 cm","finish":"Cat berbasis air, lapisan matte","contents":"1 papan puzzle, 6 keping","care":"Lap dengan kain lembap, lalu keringkan. Hindari paparan air berlebih."},"en":{"name":"Morning Garden Puzzle","category":"Growing companions","age":"3–6 years","description":"Softly coloured pieces that invite little hands to recognise shapes while arranging a morning scene.","wood":"Plywood birch","dimensions":"22 × 22 × 1.2 cm","finish":"Water-based paint, matte finish","contents":"1 puzzle board, 6 pieces","care":"Wipe with a damp cloth, then dry. Avoid excess water."},"ar":{"name":"أحجية حديقة الصباح","category":"رفيق النمو","age":"٣–٦ سنوات","description":"قطع بألوان هادئة تدعو الأيدي الصغيرة إلى تمييز الأشكال أثناء ترتيب مشهد صباحي.","wood":"خشـب بتولا رقائقي","dimensions":"٢٢ × ٢٢ × ١٫٢ سم","finish":"طلاء مائي بتشطيب مطفي","contents":"لوح أحجية واحد و٦ قطع","care":"يُمسح بقطعة قماش مبللة ثم يُجفف. تجنب الماء الزائد."}}'::jsonb, null, null, '[]'::jsonb),
  (5, 'number-tower', 5, 'published', '#F3E3C8', '#C98A3B', 'blocks', '{"id":{"name":"Menara Angka","category":"Main sambil belajar","age":"1–3 tahun","description":"Enam gelang warna yang disusun dari besar ke kecil, dengan angka terukir di setiap tingkatnya.","wood":"Kayu pinus solid","dimensions":"12 × 12 × 21 cm","finish":"Cat berbasis air, lapisan matte","contents":"6 gelang kayu dan 1 tiang","care":"Lap dengan kain lembap, lalu keringkan. Hindari direndam."},"en":{"name":"Number Tower","category":"Learn through play","age":"1–3 years","description":"Six coloured rings stacked from large to small, with a number carved into every level.","wood":"Solid pine wood","dimensions":"12 × 12 × 21 cm","finish":"Water-based paint, matte finish","contents":"6 wooden rings and 1 post","care":"Wipe with a damp cloth, then dry. Do not soak."},"ar":{"name":"برج الأرقام","category":"التعلّم باللعب","age":"١–٣ سنوات","description":"ست حلقات ملوّنة تُرتّب من الأكبر إلى الأصغر، مع رقم محفور على كل مستوى.","wood":"خشب صنوبر صلب","dimensions":"١٢ × ١٢ × ٢١ سم","finish":"طلاء مائي بتشطيب مطفي","contents":"٦ حلقات خشبية وعمود واحد","care":"يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء."}}'::jsonb, null, null, '[]'::jsonb),
  (6, 'dodo-pull-duck', 6, 'published', '#E4EDE2', '#6E9A6A', 'car', '{"id":{"name":"Bebek Tarik Dodo","category":"Gerak & jelajah","age":"1–3 tahun","description":"Bebek kayu bertali yang mengikuti langkah kecil, rodanya berputar dan kepalanya bergoyang.","wood":"Kayu karet solid","dimensions":"20 × 9 × 13 cm, tali 50 cm","finish":"Cat berbasis air, lapisan matte","contents":"1 bebek tarik dengan tali","care":"Lap dengan kain lembap, lalu keringkan. Hindari direndam."},"en":{"name":"Dodo Pull Duck","category":"Move & explore","age":"1–3 years","description":"A stringed wooden duck that follows little footsteps, wheels turning and head bobbing.","wood":"Solid rubberwood","dimensions":"20 × 9 × 13 cm, 50 cm string","finish":"Water-based paint, matte finish","contents":"1 pull duck with string","care":"Wipe with a damp cloth, then dry. Do not soak."},"ar":{"name":"بطة الجر دودو","category":"الحركة والاستكشاف","age":"١–٣ سنوات","description":"بطة خشبية بحبل تتبع الخطوات الصغيرة، تدور عجلاتها ويتمايل رأسها.","wood":"خشب مطاط صلب","dimensions":"٢٠ × ٩ × ١٣ سم، حبل ٥٠ سم","finish":"طلاء مائي بتشطيب مطفي","contents":"بطة جر واحدة مع حبل","care":"يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء."}}'::jsonb, null, null, '[]'::jsonb),
  (7, 'melody-xylophone', 7, 'published', '#F1DDE0', '#B76B78', 'blocks', '{"id":{"name":"Xilofon Melodi","category":"Main sambil belajar","age":"2–5 tahun","description":"Delapan bilah nada di atas badan kayu, cukup keras untuk tangan kecil dan cukup lembut untuk rumah yang tenang.","wood":"Kayu pinus solid dengan bilah logam","dimensions":"26 × 15 × 4 cm","finish":"Cat berbasis air, lapisan matte","contents":"1 xilofon dan 2 pemukul kayu","care":"Lap dengan kain lembap, lalu keringkan. Hindari direndam."},"en":{"name":"Melody Xylophone","category":"Learn through play","age":"2–5 years","description":"Eight note bars on a wooden body, loud enough for small hands and gentle enough for a quiet house.","wood":"Solid pine wood with metal bars","dimensions":"26 × 15 × 4 cm","finish":"Water-based paint, matte finish","contents":"1 xylophone and 2 wooden mallets","care":"Wipe with a damp cloth, then dry. Do not soak."},"ar":{"name":"زيلوفون الألحان","category":"التعلّم باللعب","age":"٢–٥ سنوات","description":"ثمانية قضبان نغمية على جسم خشبي، عالية بما يكفي للأيدي الصغيرة وهادئة بما يكفي للبيت.","wood":"خشب صنوبر صلب مع قضبان معدنية","dimensions":"٢٦ × ١٥ × ٤ سم","finish":"طلاء مائي بتشطيب مطفي","contents":"زيلوفون واحد ومطرقتان خشبيتان","care":"يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء."}}'::jsonb, null, null, '[]'::jsonb),
  (8, 'time-wooden-clock', 8, 'published', '#E1E8EA', '#5E7F8A', 'puzzle', '{"id":{"name":"Jam Kayu Waktu","category":"Teman tumbuh","age":"3–6 tahun","description":"Papan jam dengan dua jarum yang bisa diputar sendiri, untuk mengenal angka dan urutan hari.","wood":"Kayu birch lapis","dimensions":"24 × 24 × 2,4 cm","finish":"Cat berbasis air, lapisan matte","contents":"1 papan jam dengan 2 jarum","care":"Lap dengan kain lembap, lalu keringkan. Hindari direndam."},"en":{"name":"Time Wooden Clock","category":"Growing companions","age":"3–6 years","description":"A clock board with two hands a child can turn by hand, for learning numbers and the shape of a day.","wood":"Plywood birch","dimensions":"24 × 24 × 2.4 cm","finish":"Water-based paint, matte finish","contents":"1 clock board with 2 hands","care":"Wipe with a damp cloth, then dry. Do not soak."},"ar":{"name":"ساعة الوقت الخشبية","category":"رفيق النمو","age":"٣–٦ سنوات","description":"لوح ساعة بعقربين يمكن للطفل تدويرهما بيده، للتعرّف على الأرقام وتسلسل اليوم.","wood":"خشب بتولا رقائقي","dimensions":"٢٤ × ٢٤ × ٢٫٤ سم","finish":"طلاء مائي بتشطيب مطفي","contents":"لوح ساعة واحد بعقربين","care":"يُمسح بقطعة قماش مبللة ثم يُجفف. لا يُنقع في الماء."}}'::jsonb, null, null, '[]'::jsonb)
on conflict (id) do update set
  slug = excluded.slug,
  "order" = excluded."order",
  status = excluded.status,
  surface = excluded.surface,
  accent = excluded.accent,
  illustration = excluded.illustration,
  translations = excluded.translations,
  image_url = excluded.image_url,
  image_path = excluded.image_path,
  variants = excluded.variants;
