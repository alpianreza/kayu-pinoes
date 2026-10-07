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
