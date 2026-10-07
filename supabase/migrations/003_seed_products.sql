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
