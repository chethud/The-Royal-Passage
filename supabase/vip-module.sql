-- ---------------------------------------------------------------------------
-- VIP MODULE (mirrors homestay module — run after homestay-module.sql)
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

create table if not exists public.vip_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.vip_owners (id) on delete cascade,
  slug text not null unique,
  title text not null,
  tagline text,
  description text,
  property_type text not null check (property_type in (
    'Palace Suite', 'Private Villa', 'Royal Retreat', 'Heritage Mansion', 'Luxury Suite'
  )),
  city_slug text references public.cities (slug),
  city text not null,
  region text,
  address text,
  map_link text,
  amenities text[] not null default '{}',
  house_rules text[] not null default '{}',
  concierge_note text,
  check_in_time time not null default '15:00',
  check_out_time time not null default '12:00',
  hero_image_url text,
  gallery_urls text[] not null default '{}',
  price_per_night_minor integer not null default 0,
  currency_code text not null default 'INR',
  bedrooms integer not null default 1,
  bathrooms integer not null default 1,
  max_guests integer not null default 2,
  rating_avg numeric(3,2) not null default 0,
  reviews_count integer not null default 0,
  status text not null default 'draft'
    check (status in ('draft', 'pending_review', 'published', 'rejected', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vip_listings_owner on public.vip_listings (owner_id);
create index if not exists idx_vip_listings_status on public.vip_listings (status);

drop trigger if exists trg_vip_listings_updated on public.vip_listings;
create trigger trg_vip_listings_updated
  before update on public.vip_listings
  for each row execute procedure public.set_updated_at();

create table if not exists public.vip_bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.vip_listings (id) on delete restrict,
  guest_user_id uuid references auth.users (id) on delete set null,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  check_in date not null,
  check_out date not null,
  guest_count integer not null default 1 check (guest_count >= 1),
  room_count integer not null default 1 check (room_count >= 1),
  total_amount_minor integer not null default 0,
  currency_code text not null default 'INR',
  booking_status text not null default 'pending'
    check (booking_status in ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'refunded')),
  payment_method text not null default 'cod',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vip_bookings_listing on public.vip_bookings (listing_id);
create index if not exists idx_vip_bookings_guest on public.vip_bookings (guest_user_id);

drop trigger if exists trg_vip_bookings_updated on public.vip_bookings;
create trigger trg_vip_bookings_updated
  before update on public.vip_bookings
  for each row execute procedure public.set_updated_at();
