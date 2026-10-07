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

  -- 7. Foto utama (satu baris primer; galeri menyusul di masa depan).
  delete from public.product_images where product_id = v_id and variant_id is null;
  v_text := nullif(trim(coalesce(payload->>'imagePath', '')), '');
  if v_text is null then
    v_text := nullif(trim(coalesce(payload->>'imageUrl', '')), '');
  end if;
  if v_text is not null then
    insert into public.product_images (product_id, storage_path, sort_order, is_primary)
    values (v_id, v_text, 0, true);
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
