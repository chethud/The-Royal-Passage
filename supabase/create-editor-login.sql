-- =============================================================================
-- CREATE EDITOR LOGIN: edit@gmail.com / Edit@123
-- =============================================================================
-- "Invalid login credentials" means this auth user does NOT exist yet.
-- Running FULL_SCHEMA.sql alone cannot create Supabase Auth passwords.
--
-- DO THIS FIRST (Supabase Dashboard):
--   1. Open https://supabase.com/dashboard → your project
--   2. Authentication → Users → Add user → Create new user
--   3. Email:    edit@gmail.com
--   4. Password: Edit@123
--   5. Turn ON  "Auto Confirm User"  ← required
--   6. Click Create user
--
-- THEN run the SQL below (SQL Editor → New query → Run):
-- =============================================================================

-- Allow editor role (safe if already applied from FULL_SCHEMA.sql)
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('guest', 'host', 'admin', 'editor'));

insert into public.profiles (id, full_name, role)
select id, 'Homepage Editor', 'editor'
from auth.users
where lower(email) = lower('edit@gmail.com')
on conflict (id) do update
  set role = 'editor',
      full_name = 'Homepage Editor';

-- Verify (should show one row with role = editor):
-- select u.email, p.role, p.full_name
-- from auth.users u
-- join public.profiles p on p.id = u.id
-- where lower(u.email) = lower('edit@gmail.com');
