-- ============================================================================
-- 007 - Email admin resmi tambahan: admin@kayupinoes.com.
-- ============================================================================
-- Mengganti fungsi bootstrap_admin dari 004 supaya DUA email resmi otomatis
-- masuk tabel admin_users begitu akunnya dibuat di Authentication. Akun yang
-- sudah ada sekarang pun langsung ditambahkan di bagian akhir.
-- Aman dijalankan ulang (idempotent).
-- ============================================================================

create or replace function public.bootstrap_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if lower(new.email) in ('alpianrezha@gmail.com', 'admin@kayupinoes.com') then
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

-- Akun yang sudah ada sebelum baris ini dijalankan.
insert into public.admin_users (user_id)
select u.id from auth.users u
where lower(u.email) in ('alpianrezha@gmail.com', 'admin@kayupinoes.com')
on conflict (user_id) do nothing;
