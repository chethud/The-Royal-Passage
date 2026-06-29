-- ---------------------------------------------------------------------------
-- VIP MODULE — curated packages & custom enquiries (run after homestay-module.sql)
-- ---------------------------------------------------------------------------

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('guest', 'host', 'admin', 'editor', 'homestay_owner', 'vip_owner'));

alter table public.profiles
  add column if not exists vip_owner_id uuid;

create table if not exists public.vip_owners (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  address text,
  approval_status text not null default 'approved'
    check (approval_status in ('pending', 'approved', 'rejected', 'suspended')),
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_vip_owners_updated on public.vip_owners;
create trigger trg_vip_owners_updated
  before update on public.vip_owners
  for each row execute procedure public.set_updated_at();

alter table public.profiles
  drop constraint if exists profiles_vip_owner_id_fkey;
alter table public.profiles
  add constraint profiles_vip_owner_id_fkey
  foreign key (vip_owner_id) references public.vip_owners (id) on delete set null;

create table if not exists public.vip_packages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.vip_owners (id) on delete cascade,
  slug text not null unique,
  title text not null,
  tagline text,
  description text,
  package_type text not null check (package_type in (
    'Palace Experience', 'Heritage Circuit', 'Wellness Retreat',
    'Culinary Journey', 'Private Celebration'
  )),
  city_slug text references public.cities (slug),
  city text not null,
  region text,
  highlights text[] not null default '{}',
  concierge_note text,
  hero_image_url text,
  gallery_urls text[] not null default '{}',
  price_from_minor integer not null default 0,
  currency_code text not null default 'INR',
  duration_days integer not null default 1 check (duration_days >= 1),
  max_guests integer not null default 2,
  rating_avg numeric(3,2) not null default 0,
  reviews_count integer not null default 0,
  status text not null default 'draft'
    check (status in ('draft', 'pending_review', 'published', 'rejected', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vip_packages_owner on public.vip_packages (owner_id);
create index if not exists idx_vip_packages_status on public.vip_packages (status);

drop trigger if exists trg_vip_packages_updated on public.vip_packages;
create trigger trg_vip_packages_updated
  before update on public.vip_packages
  for each row execute procedure public.set_updated_at();

create table if not exists public.vip_bookings (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.vip_packages (id) on delete restrict,
  guest_user_id uuid references auth.users (id) on delete set null,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  travel_start date not null,
  travel_end date not null,
  guest_count integer not null default 1 check (guest_count >= 1),
  total_amount_minor integer not null default 0,
  currency_code text not null default 'INR',
  booking_status text not null default 'pending'
    check (booking_status in ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'refunded')),
  payment_method text not null default 'cod',
  is_custom_package boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Upgrade legacy vip_bookings tables (CREATE TABLE IF NOT EXISTS skips new columns).
alter table public.vip_bookings add column if not exists package_id uuid;
alter table public.vip_bookings add column if not exists guest_user_id uuid;
alter table public.vip_bookings add column if not exists guest_name text;
alter table public.vip_bookings add column if not exists guest_email text;
alter table public.vip_bookings add column if not exists guest_phone text;
alter table public.vip_bookings add column if not exists travel_start date;
alter table public.vip_bookings add column if not exists travel_end date;
alter table public.vip_bookings add column if not exists guest_count integer not null default 1;
alter table public.vip_bookings add column if not exists total_amount_minor integer not null default 0;
alter table public.vip_bookings add column if not exists currency_code text not null default 'INR';
alter table public.vip_bookings add column if not exists booking_status text not null default 'pending';
alter table public.vip_bookings add column if not exists payment_status text not null default 'pending';
alter table public.vip_bookings add column if not exists payment_method text not null default 'cod';
alter table public.vip_bookings add column if not exists is_custom_package boolean not null default false;
alter table public.vip_bookings add column if not exists notes text;
alter table public.vip_bookings add column if not exists created_at timestamptz not null default now();
alter table public.vip_bookings add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'vip_bookings' and column_name = 'vip_package_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'vip_bookings' and column_name = 'package_id'
  ) then
    alter table public.vip_bookings rename column vip_package_id to package_id;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'vip_bookings_package_id_fkey'
      and conrelid = 'public.vip_bookings'::regclass
  ) then
    alter table public.vip_bookings
      add constraint vip_bookings_package_id_fkey
      foreign key (package_id) references public.vip_packages (id) on delete restrict;
  end if;
end $$;

create index if not exists idx_vip_bookings_package on public.vip_bookings (package_id);
create index if not exists idx_vip_bookings_guest on public.vip_bookings (guest_user_id);

drop trigger if exists trg_vip_bookings_updated on public.vip_bookings;
create trigger trg_vip_bookings_updated
  before update on public.vip_bookings
  for each row execute procedure public.set_updated_at();
