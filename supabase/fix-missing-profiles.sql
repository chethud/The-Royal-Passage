-- Run this in Supabase SQL Editor when bookings fail with:
--   bookings_guest_id_fkey — guest_id not present in profiles
-- Safe to re-run.

-- 1) Backfill ALL auth users missing a profile
insert into public.profiles (id, full_name, phone, role)
select
  u.id,
  coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    nullif(split_part(u.email, '@', 1), ''),
    'Guest'
  ),
  u.raw_user_meta_data->>'phone',
  'guest'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- 2) Fix one specific user (replace id if needed)
insert into public.profiles (id, full_name, role)
select
  u.id,
  coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    u.email,
    'Guest'
  ),
  'guest'
from auth.users u
where u.id = 'cfb8f0bf-928d-4614-899d-6c8cc3b7953f'
on conflict (id) do nothing;

-- 3) Verify
select
  u.id,
  u.email,
  p.id as profile_id,
  p.role
from auth.users u
left join public.profiles p on p.id = u.id
where u.id = 'cfb8f0bf-928d-4614-899d-6c8cc3b7953f';

-- 4) Optional: auto-create profiles on future booking inserts
create or replace function public.ensure_booking_guest_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.guest_id is null then
    return new;
  end if;

  insert into public.profiles (id, full_name, phone, role)
  select
    u.id,
    coalesce(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      nullif(split_part(u.email, '@', 1), ''),
      'Guest'
    ),
    u.raw_user_meta_data->>'phone',
    'guest'
  from auth.users u
  where u.id = new.guest_id
  on conflict (id) do nothing;

  if not exists (select 1 from public.profiles where id = new.guest_id) then
    raise exception 'guest_id % is not a valid auth user', new.guest_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_bookings_ensure_guest_profile on public.bookings;
create trigger trg_bookings_ensure_guest_profile
  before insert or update of guest_id on public.bookings
  for each row execute procedure public.ensure_booking_guest_profile();
