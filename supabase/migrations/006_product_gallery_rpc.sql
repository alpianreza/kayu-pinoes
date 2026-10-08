-- Migrasi 006: galeri foto produk (lebih dari satu gambar per produk).
--
-- Mengganti langkah foto pada `upsert_product`:
--   - payload lama (tanpa `images`) tetap bekerja: satu gambar utama dari
--     `imagePath`/`imageUrl` seperti sebelum migrasi ini;
--   - payload baru membawa `images` (array JSON: imageUrl, imagePath?,
--     sortOrder, isPrimary) - tabel `product_images` disinkronkan ulang
--     persis mengikuti array itu, dengan PISAH enforcement satu gambar
--     utama per produk (indeks unik parsial sudah ada sejak 001).
--
-- Tidak ada perubahan skema tabel: `product_images` (termasuk alt_text,
-- sort_order, is_primary) sudah siap untuk galeri sejak 001.

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

-- Segarkan cache skema PostgREST supaya API langsung mengenal perubahan.
notify pgrst, 'reload schema';
