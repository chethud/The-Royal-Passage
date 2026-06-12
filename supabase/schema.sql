-- =============================================================================
-- The Royal Passage — COMPLETE database schema (single file)
-- =============================================================================
-- Run this ONE file only in: Supabase Dashboard → SQL Editor → New query → Run
--
-- Includes everything from supabase/migrations/* and fix-missing-profiles.sql:
--   • profiles, hosts, cities, categories, experiences, slots
--   • COD bookings (10% platform / 90% host payout)
--   • wishlist, reviews, notifications, audit_logs, platform_settings
--   • RLS policies, auth triggers, seat reservation functions
--   • profile backfill + booking guest FK repair
--   • seed hosts, experiences, slots (dates refresh on re-run), reviews
--
-- Safe to re-run on EXISTING databases:
--   IF NOT EXISTS, ADD COLUMN IF NOT EXISTS, ON CONFLICT, DROP POLICY IF EXISTS
--
-- Payment: Pay-at-venue (COD) only — no online payment gateway.
-- Profiles: auto-created on sign-up + backfilled from auth.users + ensured on booking insert.
--
-- Admin account (create in Dashboard → Authentication, then run the block at the bottom):
--   Email: Admin@gmail.com   Password: Admin@123
--
-- RLS: broad read for anon/authenticated; writes via service role (backend API).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Updated-at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- User profiles (guest / host / admin). Linked to Supabase Auth.
-- Experience providers use the **host** role and optional hosts.host_id link.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'guest'
    check (role in ('guest', 'host', 'admin', 'editor')),
  host_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Hosts (providers). Seeded without auth so the schema is self-contained.
-- ---------------------------------------------------------------------------
create table if not exists public.hosts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  display_name text not null,
  email text,
  phone text,
  bio text,
  verified boolean not null default false,
  approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hosts
  add column if not exists auth_user_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'hosts_auth_user_id_fkey'
  ) then
    alter table public.hosts
      add constraint hosts_auth_user_id_fkey
      foreign key (auth_user_id) references auth.users (id) on delete set null;
  end if;
end $$;

create unique index if not exists idx_hosts_auth_user_id on public.hosts (auth_user_id)
  where auth_user_id is not null;

alter table public.profiles
  drop constraint if exists profiles_host_id_fkey;
alter table public.profiles
  add constraint profiles_host_id_fkey
  foreign key (host_id) references public.hosts (id) on delete set null;

drop trigger if exists trg_hosts_updated on public.hosts;
create trigger trg_hosts_updated
  before update on public.hosts
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Cities (multi-city scale: Mysuru → Karnataka → India)
-- ---------------------------------------------------------------------------
create table if not exists public.cities (
  slug text primary key,
  name text not null,
  region text,
  state text not null default 'Karnataka',
  country_code text not null default 'IN',
  tagline text,
  description text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Category reference (for filters and consistency)
-- ---------------------------------------------------------------------------
create table if not exists public.experience_categories (
  slug text primary key,
  label text not null,
  sort_order int not null default 0
);

-- ---------------------------------------------------------------------------
-- Experiences (listings). Capacity for booking is enforced per slot, not here.
-- ---------------------------------------------------------------------------
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.hosts (id) on delete restrict,
  slug text not null unique,
  title text not null,
  tagline text,
  description text,
  category_slug text not null references public.experience_categories (slug),
  city_slug text references public.cities (slug),
  city text not null,
  region text,
  address text,
  duration_minutes int not null check (duration_minutes > 0),
  experience_format text not null default 'slot_based'
    check (experience_format in ('fixed', 'slot_based', 'on_demand')),
  pricing_model text not null default 'per_person'
    check (pricing_model in ('per_person', 'per_group', 'both')),
  price_per_person_minor int not null check (price_per_person_minor >= 0),
  price_per_group_minor int,
  status text not null default 'draft'
    check (status in ('draft', 'pending_review', 'published', 'rejected', 'archived')),
  hero_image_url text,
  gallery_urls text[] not null default '{}',
  inclusions text[] not null default '{}',
  exclusions text[] not null default '{}',
  requirements text[] not null default '{}',
  min_guests_per_booking int not null default 1 check (min_guests_per_booking >= 1),
  max_guests_per_booking int not null default 10 check (max_guests_per_booking >= 1),
  cancellation_policy text,
  average_rating numeric(3, 2) not null default 0
    check (average_rating >= 0 and average_rating <= 5),
  review_count int not null default 0
    check (review_count >= 0),
  currency_code text not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_experiences_host on public.experiences (host_id);
create index if not exists idx_experiences_city on public.experiences (city);
create index if not exists idx_experiences_category on public.experiences (category_slug);
create index if not exists idx_experiences_status on public.experiences (status);

drop trigger if exists trg_experiences_updated on public.experiences;
create trigger trg_experiences_updated
  before update on public.experiences
  for each row execute procedure public.set_updated_at();

-- Upgrade existing experiences table (CREATE TABLE IF NOT EXISTS skips new columns on old DBs)
alter table public.experiences
  add column if not exists city_slug text,
  add column if not exists requirements text[] default '{}',
  add column if not exists min_guests_per_booking int default 1,
  add column if not exists max_guests_per_booking int default 10;

-- FK for city_slug (idempotent)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'experiences_city_slug_fkey'
      and conrelid = 'public.experiences'::regclass
  ) then
    alter table public.experiences
      add constraint experiences_city_slug_fkey
      foreign key (city_slug) references public.cities (slug);
  end if;
end $$;

create index if not exists idx_experiences_city_slug on public.experiences (city_slug);

-- ---------------------------------------------------------------------------
-- Slots: capacity and sold seats (overbooking prevention at application level)
-- ---------------------------------------------------------------------------
create table if not exists public.experience_slots (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences (id) on delete cascade,
  slot_date date not null,
  start_time time not null,
  end_time time not null,
  capacity int not null check (capacity > 0),
  seats_sold int not null default 0 check (seats_sold >= 0),
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  constraint chk_seats check (seats_sold <= capacity)
);

create index if not exists idx_slots_experience_date on public.experience_slots (experience_id, slot_date);

-- ---------------------------------------------------------------------------
-- Bookings (Pay-at-venue / COD model)
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.experience_slots (id) on delete restrict,
  experience_id uuid references public.experiences (id) on delete restrict,
  guest_id uuid references public.profiles (id) on delete set null,
  guest_email text not null,
  guest_name text not null,
  guest_phone text,
  customer_user_id uuid,
  guest_count int not null check (guest_count > 0),
  participant_count int,
  -- Legacy status (kept for compatibility)
  status text not null default 'pending_payment'
    check (status in (
      'pending_payment', 'confirmed', 'cancelled_by_guest', 'cancelled_by_host',
      'completed', 'refunded', 'no_show'
    )),
  -- COD booking lifecycle
  booking_status text not null default 'pending'
    check (booking_status in ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_method text not null default 'cod' check (payment_method in ('cod')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  subtotal_minor int not null check (subtotal_minor >= 0),
  total_amount int,
  platform_fee_minor int not null default 0 check (platform_fee_minor >= 0),
  host_payout_minor int not null default 0 check (host_payout_minor >= 0),
  currency_code text not null default 'INR',
  payment_reference text,
  hold_expires_at timestamptz,
  notes text,
  confirmed_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by text check (cancelled_by is null or cancelled_by in ('guest', 'host', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Upgrade existing bookings table (CREATE TABLE IF NOT EXISTS skips new columns on old DBs)
alter table public.bookings
  add column if not exists experience_id uuid,
  add column if not exists guest_id uuid,
  add column if not exists participant_count int,
  add column if not exists total_amount int,
  add column if not exists payment_method text default 'cod',
  add column if not exists payment_status text default 'pending',
  add column if not exists booking_status text default 'pending',
  add column if not exists notes text,
  add column if not exists confirmed_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'bookings_experience_id_fkey'
      and conrelid = 'public.bookings'::regclass
  ) then
    alter table public.bookings
      add constraint bookings_experience_id_fkey
      foreign key (experience_id) references public.experiences (id) on delete restrict;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'bookings_guest_id_fkey'
      and conrelid = 'public.bookings'::regclass
  ) then
    alter table public.bookings
      add constraint bookings_guest_id_fkey
      foreign key (guest_id) references public.profiles (id) on delete set null;
  end if;
end $$;

-- Backfill profiles BEFORE linking bookings.guest_id (prevents FK violations).
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

-- Backfill COD columns from legacy bookings data (guest_id only when profile exists).
update public.bookings
set
  participant_count = coalesce(participant_count, guest_count),
  total_amount = coalesce(total_amount, subtotal_minor),
  experience_id = coalesce(
    experience_id,
    (select es.experience_id from public.experience_slots es where es.id = bookings.slot_id)
  )
where participant_count is null
   or total_amount is null
   or experience_id is null;

update public.bookings b
set guest_id = b.customer_user_id
where b.guest_id is null
  and b.customer_user_id is not null
  and exists (select 1 from public.profiles p where p.id = b.customer_user_id);

update public.bookings
set booking_status = case
  when status in ('confirmed') then 'confirmed'
  when status in ('completed') then 'completed'
  when status like 'cancelled%' then 'cancelled'
  else 'pending'
end
where booking_status = 'pending' and status is not null and status <> 'pending_payment';

-- Backfill platform fee split (10% admin / 90% host) on legacy rows.
update public.bookings
set
  platform_fee_minor = round(subtotal_minor * 0.10),
  host_payout_minor = subtotal_minor - round(subtotal_minor * 0.10)
where subtotal_minor > 0
  and (platform_fee_minor = 0 or host_payout_minor = 0);

create index if not exists idx_bookings_slot on public.bookings (slot_id);
create index if not exists idx_bookings_guest on public.bookings (guest_id);
create index if not exists idx_bookings_experience on public.bookings (experience_id);
create index if not exists idx_bookings_booking_status on public.bookings (booking_status);
create index if not exists idx_bookings_payment_status on public.bookings (payment_status);

drop trigger if exists trg_bookings_updated on public.bookings;
create trigger trg_bookings_updated
  before update on public.bookings
  for each row execute procedure public.set_updated_at();

-- Ensure guest_id always has a matching profiles row (fixes OAuth / manual SQL inserts).
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
    raise exception 'guest_id % is not a valid auth user — cannot create booking', new.guest_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_bookings_ensure_guest_profile on public.bookings;
create trigger trg_bookings_ensure_guest_profile
  before insert or update of guest_id on public.bookings
  for each row execute procedure public.ensure_booking_guest_profile();

-- ---------------------------------------------------------------------------
-- Atomic seat reservation (prevents overbooking)
-- ---------------------------------------------------------------------------
create or replace function public.reserve_booking_seats(
  p_slot_id uuid,
  p_guest_count int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_available int;
begin
  if p_guest_count < 1 then
    return false;
  end if;

  select capacity - seats_sold into v_available
  from public.experience_slots
  where id = p_slot_id and not is_blocked
  for update;

  if v_available is null or v_available < p_guest_count then
    return false;
  end if;

  update public.experience_slots
  set seats_sold = seats_sold + p_guest_count
  where id = p_slot_id;

  return true;
end;
$$;

create or replace function public.release_booking_seats(
  p_slot_id uuid,
  p_guest_count int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.experience_slots
  set seats_sold = greatest(0, seats_sold - p_guest_count)
  where id = p_slot_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences (id) on delete cascade,
  booking_id uuid references public.bookings (id) on delete set null,
  guest_id uuid references public.profiles (id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  reviewer_display_name text,
  host_reply text,
  host_replied_at timestamptz,
  is_verified boolean not null default false,
  status text not null default 'published'
    check (status in ('published', 'hidden', 'flagged')),
  created_at timestamptz not null default now(),
  constraint uq_review_booking unique (booking_id)
);

-- Upgrade existing reviews table (CREATE TABLE IF NOT EXISTS skips new columns on old DBs)
alter table public.reviews
  add column if not exists booking_id uuid,
  add column if not exists guest_id uuid,
  add column if not exists host_reply text,
  add column if not exists host_replied_at timestamptz,
  add column if not exists is_verified boolean default false,
  add column if not exists status text default 'published';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'reviews_booking_id_fkey'
      and conrelid = 'public.reviews'::regclass
  ) then
    alter table public.reviews
      add constraint reviews_booking_id_fkey
      foreign key (booking_id) references public.bookings (id) on delete set null;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'reviews_guest_id_fkey'
      and conrelid = 'public.reviews'::regclass
  ) then
    alter table public.reviews
      add constraint reviews_guest_id_fkey
      foreign key (guest_id) references public.profiles (id) on delete set null;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'uq_review_booking'
      and conrelid = 'public.reviews'::regclass
  ) then
    alter table public.reviews
      add constraint uq_review_booking unique (booking_id);
  end if;
end $$;

update public.reviews
set status = 'published'
where status is null;

create index if not exists idx_reviews_experience on public.reviews (experience_id);
create index if not exists idx_reviews_guest on public.reviews (guest_id);
create index if not exists idx_reviews_status on public.reviews (status);

-- Keep experience ratings in sync with published reviews
create or replace function public.refresh_experience_rating()
returns trigger
language plpgsql
as $$
declare
  v_exp_id uuid;
begin
  v_exp_id := coalesce(new.experience_id, old.experience_id);
  update public.experiences e
  set
    average_rating = coalesce((
      select round(avg(r.rating)::numeric, 2)
      from public.reviews r
      where r.experience_id = v_exp_id and r.status = 'published'
    ), 0),
    review_count = (
      select count(*)::int
      from public.reviews r
      where r.experience_id = v_exp_id and r.status = 'published'
    )
  where e.id = v_exp_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_reviews_rating on public.reviews;
create trigger trg_reviews_rating
  after insert or update or delete on public.reviews
  for each row execute procedure public.refresh_experience_rating();

-- ---------------------------------------------------------------------------
-- In-app notifications
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in (
    'booking_created', 'booking_confirmed', 'booking_cancelled',
    'booking_reminder', 'review_request', 'host_approved', 'review_received'
  )),
  title text not null,
  body text not null,
  metadata jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Audit logs (admin ops visibility)
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_created on public.audit_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- Wishlist (guest saved experiences)
-- ---------------------------------------------------------------------------
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.profiles (id) on delete cascade,
  experience_id uuid not null references public.experiences (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint uq_wishlist_guest_experience unique (guest_id, experience_id)
);

create index if not exists idx_wishlist_guest on public.wishlist (guest_id);
create index if not exists idx_wishlist_experience on public.wishlist (experience_id);

-- ---------------------------------------------------------------------------
-- Platform settings (e.g. commission)
-- ---------------------------------------------------------------------------
create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null
);

-- ---------------------------------------------------------------------------
-- Row Level Security — enable on all public tables
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.hosts enable row level security;
alter table public.cities enable row level security;
alter table public.experience_categories enable row level security;
alter table public.experiences enable row level security;
alter table public.experience_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlist enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.platform_settings enable row level security;

-- Drop existing policies if re-running in dev (names are stable)
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "hosts_select_all" on public.hosts;
drop policy if exists "cities_select_active" on public.cities;
drop policy if exists "categories_select_all" on public.experience_categories;
drop policy if exists "experiences_select_all" on public.experiences;
drop policy if exists "slots_select_all" on public.experience_slots;
drop policy if exists "bookings_select_all" on public.bookings;
drop policy if exists "bookings_select_own" on public.bookings;
drop policy if exists "bookings_select_host" on public.bookings;
drop policy if exists "reviews_select_all" on public.reviews;
drop policy if exists "wishlist_own" on public.wishlist;
drop policy if exists "notifications_own" on public.notifications;
drop policy if exists "platform_settings_select_all" on public.platform_settings;

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id and role = 'guest');

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (auth.uid() = id and role = 'guest')
  with check (auth.uid() = id and role = 'guest');

create policy "hosts_select_all"
  on public.hosts for select to anon, authenticated
  using (true);

create policy "cities_select_active"
  on public.cities for select to anon, authenticated
  using (is_active = true);

create policy "categories_select_all"
  on public.experience_categories for select to anon, authenticated
  using (true);

create policy "experiences_select_all"
  on public.experiences for select to anon, authenticated
  using (true);

create policy "slots_select_all"
  on public.experience_slots for select to anon, authenticated
  using (true);

create policy "bookings_select_own"
  on public.bookings for select to authenticated
  using (guest_id = auth.uid());

create policy "bookings_select_host"
  on public.bookings for select to authenticated
  using (
    exists (
      select 1
      from public.experiences e
      join public.hosts h on h.id = e.host_id
      where e.id = bookings.experience_id
        and h.auth_user_id = auth.uid()
    )
    or exists (
      select 1
      from public.profiles p
      join public.experiences e on e.host_id = p.host_id
      where p.id = auth.uid()
        and p.role = 'host'
        and e.id = bookings.experience_id
    )
  );

create policy "reviews_select_all"
  on public.reviews for select to anon, authenticated
  using (true);

create policy "wishlist_own"
  on public.wishlist for all to authenticated
  using (guest_id = auth.uid())
  with check (guest_id = auth.uid());

create policy "notifications_own"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());

create policy "platform_settings_select_all"
  on public.platform_settings for select to anon, authenticated
  using (true);

-- Auto-create profile on sign-up (guests only — hosts/admins created by admin)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      nullif(split_part(new.email, '@', 1), ''),
      'Guest'
    ),
    new.raw_user_meta_data->>'phone',
    'guest'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profiles again after auth trigger (OAuth / pre-trigger signups). Safe to re-run.
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

-- Link any remaining bookings to profiles where customer_user_id matches.
update public.bookings b
set guest_id = b.customer_user_id
where b.guest_id is null
  and b.customer_user_id is not null
  and exists (select 1 from public.profiles p where p.id = b.customer_user_id);

-- ---------------------------------------------------------------------------
-- Seed data (deterministic UUIDs for idempotent re-runs)
-- ---------------------------------------------------------------------------
insert into public.cities (slug, name, region, state, tagline, description, sort_order) values
  ('mysuru', 'Mysuru', 'Southern Karnataka', 'Karnataka',
   'Palaces, pottery, and slow living',
   'The Royal Passage home base — heritage walks, artisan studios, farm mornings, and culinary immersions.', 10),
  ('bengaluru', 'Bengaluru', 'Urban Karnataka', 'Karnataka',
   'Creative city escapes',
   'Weekend workshops, farm-to-table sessions, and curated urban experiences beyond the traffic.', 20),
  ('coorg', 'Coorg', 'Western Ghats', 'Karnataka',
   'Coffee country rituals',
   'Plantation walks, Kodava cuisine, and misty valley experiences in the Scotland of India.', 30),
  ('chikmagalur', 'Chikmagalur', 'Malnad hills', 'Karnataka',
   'Coffee trails and cloud forests',
   'Bean-to-cup journeys, waterfall hikes, and homestay-hosted cultural evenings.', 40),
  ('hampi', 'Hampi', 'Vijayanagara heritage', 'Karnataka',
   'Ruins at golden hour',
   'Archaeological walks, boulder sunsets, and riverside storytelling with local historians.', 50),
  ('ooty', 'Ooty', 'Nilgiri hills', 'Tamil Nadu',
   'Mist, tea, and mountain calm',
   'Tea estate visits, botanical walks, and slow Nilgiri experiences for mindful travellers.', 60)
on conflict (slug) do nothing;

-- Backfill city_slug on experiences created before Sprint 6
update public.experiences
set city_slug = 'mysuru'
where city_slug is null
  and lower(city) in ('mysuru', 'mysore', 'nanjangud');

insert into public.experience_categories (slug, label, sort_order) values
  ('art_craft', 'Art & Craft', 10),
  ('outdoor_nature', 'Outdoor & Nature', 20),
  ('culinary', 'Culinary & Food', 30),
  ('wellness', 'Wellness & Healing', 40),
  ('digital_detox', 'Digital Detox & Slow Living', 50),
  ('rural_farm', 'Rural & Farm', 60),
  ('cultural_heritage', 'Cultural & Heritage', 70),
  ('premium_luxury', 'Premium / Luxury', 80)
on conflict (slug) do nothing;

insert into public.platform_settings (key, value) values
  ('commission_percent', '10'::jsonb),
  ('default_currency', '"INR"'::jsonb),
  ('homepage_showcase', '[
    {"id":"showcase-pottery","iconKey":"pottery","title":"Pottery Experience","imageUrl":"/assets/exp-craft.jpg","alt":"Hands shaping clay on a pottery wheel","href":"/experiences?category=Craft"},
    {"id":"showcase-cooking","iconKey":"flame","title":"Outdoor Cooking","imageUrl":"/assets/outdoor-cooking.png","alt":"Open fire cooking in the wild under warm light","href":"/experiences?category=Tasting"},
    {"id":"showcase-heritage","iconKey":"heritage","title":"Heritage Walks","imageUrl":"/assets/hero-image.png","alt":"Mysuru palace at golden hour","href":"/experiences"}
  ]'::jsonb),
  ('homepage_journal', '[
    {"id":"journal-walk","imageUrl":"/assets/hero-image.png","alt":"Mysuru Palace illuminated at sunset","title":"A Walk Through Time","excerpt":"Heritage walks in Mysuru are like stepping into a royal era."},
    {"id":"journal-flavours","imageUrl":"/assets/masala-dose.png","alt":"A crisp masala dose served with chutneys","title":"Flavours of Mysuru","excerpt":"Explore the culinary legacy of the Wadiyars."},
    {"id":"journal-nature","imageUrl":"/assets/nature-walks.png","alt":"A nature trail winding through the green hills near Mysuru","title":"Nature''s Escape","excerpt":"Unwind in the serene trails around Mysuru."}
  ]'::jsonb)
on conflict (key) do update set value = excluded.value;

insert into public.hosts (id, display_name, email, bio, verified, approval_status) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Heritage Clay Studio — Mysuru', 'studio@example.com',
   'Third-generation potters hosting intimate wheel and hand-building sessions.', true, 'approved'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Devaraja Organic Farm', 'farm@example.com',
   'Family-run farm experiences minutes from the city.', true, 'approved'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Silver Oak Sound Sanctuary', 'sound@example.com',
   'Sound therapy and restorative sessions led by certified practitioners.', true, 'approved')
on conflict (id) do nothing;

insert into public.experiences (
  id, host_id, slug, title, tagline, description, category_slug, city_slug, city, region, address,
  duration_minutes, experience_format, pricing_model, price_per_person_minor, price_per_group_minor,
  status, hero_image_url, inclusions, exclusions, cancellation_policy, average_rating, review_count, currency_code
) values
  (
    'e0000001-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'mysuru-wheel-and-clay',
    'Wheel & Clay at Heritage Studio',
    'A morning at the wheel with master potters',
    'Learn throwing and hand-building in a sunlit studio. Take home two pieces, fired and glazed by the studio.',
    'art_craft', 'mysuru', 'Mysuru', 'Karnataka', 'Gokulam, Mysuru', 180, 'slot_based', 'per_person', 240000, null,
    'published',
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&q=80',
    array['Materials', 'Two finished pieces', 'Refreshments'],
    array['Transport'],
    'Full refund if cancelled more than 24 hours before the slot. 50% refund within 24 hours.',
    4.95, 48, 'INR'
  ),
  (
    'e0000002-0000-0000-0000-000000000002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'farm-walk-and-breakfast',
    'Sunrise Farm Walk & Breakfast',
    'Fields, filter coffee, and a slow Karnataka breakfast',
    'Walk the rows before heat sets in, then share a traditional breakfast under a neem tree.',
    'rural_farm', 'mysuru', 'Mysuru', 'Karnataka', 'Hunsur Road outskirts', 150, 'slot_based', 'per_person', 185000, null,
    'published',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
    array['Guided walk', 'Breakfast', 'Farm tour'],
    array[]::text[],
    'Full refund up to 24 hours before. Weather cancellations fully refunded.',
    4.88, 112, 'INR'
  ),
  (
    'e0000003-0000-0000-0000-000000000003',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'sound-bowl-evening',
    'Sound Bowl Evening Reset',
    'Ninety minutes of resonance and stillness',
    'Group sound journey with Himalayan bowls, followed by herbal tea in the garden.',
    'wellness', 'mysuru', 'Mysuru', 'Karnataka', 'Chamundi Hill foothills', 90, 'slot_based', 'per_person', 165000, null,
    'published',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80',
    array['Mats', 'Blankets', 'Tea'],
    array['Private transport'],
    'Full refund up to 24 hours before.',
    4.91, 64, 'INR'
  ),
  (
    'e0000004-0000-0000-0000-000000000004',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'estate-coffee-cupping',
    'Estate-Style Coffee Cupping',
    'From cherry to cup — a sensory workshop',
    'Roast sample beans, learn grind theory, and cup three estate lots side by side.',
    'culinary', 'mysuru', 'Nanjangud', 'Karnataka', 'Coffee Collective Nanjangud', 120, 'slot_based', 'per_person', 145000, null,
    'published',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
    array['Cupping sets', 'Take-home sample bag'],
    array[]::text[],
    'Full refund up to 24 hours before.',
    4.82, 37, 'INR'
  ),
  (
    'e0000005-0000-0000-0000-000000000005',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'palace-stories-walk',
    'Palace Stories Walk',
    'Heritage narrative walk — experience format, not a generic tour',
    'Small groups only. Story-led paths with archival imagery and live narration.',
    'cultural_heritage', 'mysuru', 'Mysuru', 'Karnataka', 'Old city core', 105, 'slot_based', 'per_person', 95000, null,
    'published',
    'https://images.unsplash.com/photo-1524492412937-b280c272500d?w=1200&q=80',
    array['Guided walk', 'Printed route map'],
    array['Monument entry tickets'],
    'Full refund up to 24 hours before.',
    4.79, 201, 'INR'
  )
on conflict (id) do nothing;

-- Slots: relative dates so listings stay “current” after every re-run
insert into public.experience_slots (id, experience_id, slot_date, start_time, end_time, capacity, seats_sold, is_blocked)
values
  ('50000001-0000-4000-8000-000000000001', 'e0000001-0000-0000-0000-000000000001', (current_date + 2), '09:30', '12:30', 8, 3, false),
  ('50000002-0000-4000-8000-000000000002', 'e0000001-0000-0000-0000-000000000001', (current_date + 5), '09:30', '12:30', 8, 0, false),
  ('50000003-0000-4000-8000-000000000003', 'e0000002-0000-0000-0000-000000000002', (current_date + 1), '06:30', '09:00', 12, 5, false),
  ('50000004-0000-4000-8000-000000000004', 'e0000002-0000-0000-0000-000000000002', (current_date + 4), '06:30', '09:00', 12, 12, false),
  ('50000005-0000-4000-8000-000000000005', 'e0000003-0000-0000-0000-000000000003', (current_date + 2), '18:00', '19:30', 10, 2, false),
  ('50000006-0000-4000-8000-000000000006', 'e0000004-0000-0000-0000-000000000004', (current_date + 3), '10:00', '12:00', 14, 6, false),
  ('50000007-0000-4000-8000-000000000007', 'e0000005-0000-0000-0000-000000000005', (current_date + 1), '17:00', '18:45', 15, 4, false)
on conflict (id) do update set
  experience_id = excluded.experience_id,
  slot_date = excluded.slot_date,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  capacity = excluded.capacity,
  is_blocked = excluded.is_blocked;

insert into public.reviews (id, experience_id, rating, comment, reviewer_display_name) values
  ('60000001-0000-4000-8000-000000000001', 'e0000001-0000-0000-0000-000000000001', 5, 'Calm, skilled instructors — the wheel finally made sense.', 'Aditi'),
  ('60000002-0000-4000-8000-000000000002', 'e0000002-0000-0000-0000-000000000002', 5, 'Breakfast under the neem tree was unforgettable.', 'Rahul')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- REPAIR: profiles + bookings (from fix-missing-profiles.sql) — safe to re-run
-- Fixes: bookings_guest_id_fkey when guest exists in auth but not in profiles
-- ---------------------------------------------------------------------------
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

update public.bookings b
set guest_id = b.customer_user_id
where b.guest_id is null
  and b.customer_user_id is not null
  and exists (select 1 from public.profiles p where p.id = b.customer_user_id);

-- Re-apply 10% commission on any legacy booking rows still missing the split
update public.bookings
set
  platform_fee_minor = round(subtotal_minor * 0.10),
  host_payout_minor = subtotal_minor - round(subtotal_minor * 0.10)
where subtotal_minor > 0
  and (platform_fee_minor = 0 or host_payout_minor = 0);

-- ---------------------------------------------------------------------------
-- ADMIN SETUP (run AFTER creating auth user in Dashboard → Authentication)
-- ---------------------------------------------------------------------------
-- update public.profiles
-- set role = 'admin', full_name = coalesce(full_name, 'Platform Admin')
-- where id = (
--   select id from auth.users where lower(email) = lower('Admin@gmail.com')
-- );
--
-- If no profile row yet for the admin auth user:
-- insert into public.profiles (id, full_name, role)
-- select id, 'Platform Admin', 'admin'
-- from auth.users
-- where lower(email) = lower('Admin@gmail.com')
-- on conflict (id) do update set role = 'admin', full_name = excluded.full_name;

-- ---------------------------------------------------------------------------
-- HOST SETUP (after admin creates host auth user via API / admin panel)
-- ---------------------------------------------------------------------------
-- update public.hosts
-- set auth_user_id = (select id from auth.users where lower(email) = lower('host@example.com'))
-- where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
--
-- update public.profiles
-- set role = 'host', host_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', full_name = 'Host Name'
-- where id = (select id from auth.users where lower(email) = lower('host@example.com'));

-- ---------------------------------------------------------------------------
-- Storage: experience photos (host uploads → public URLs in gallery_urls)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'experience-photos',
  'experience-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read experience photos" on storage.objects;
drop policy if exists "Hosts upload experience photos" on storage.objects;
drop policy if exists "Hosts update own experience photos" on storage.objects;
drop policy if exists "Hosts delete own experience photos" on storage.objects;

create policy "Public read experience photos"
  on storage.objects for select
  to public
  using (bucket_id = 'experience-photos');

create policy "Hosts upload experience photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'experience-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Hosts update own experience photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'experience-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Hosts delete own experience photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'experience-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- SANITY CHECKS (optional — uncomment to verify after running)
-- ---------------------------------------------------------------------------
-- select 'profiles' as tbl, count(*) from public.profiles
-- union all select 'hosts', count(*) from public.hosts
-- union all select 'experiences', count(*) from public.experiences
-- union all select 'slots', count(*) from public.experience_slots
-- union all select 'bookings', count(*) from public.bookings;
--
-- select u.id, u.email, p.id as profile_id, p.role
-- from auth.users u
-- left join public.profiles p on p.id = u.id
-- order by u.created_at desc
-- limit 20;
