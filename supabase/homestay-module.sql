-- ---------------------------------------------------------------------------
-- HOMESTAY MODULE (Phase 1 schema — run after core experience tables)
-- Mirrors experience module patterns; booking uses date ranges + rooms.
-- ---------------------------------------------------------------------------

-- Extend profiles.role for homestay_owner (safe re-run)
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('guest', 'host', 'admin', 'editor', 'homestay_owner', 'vip_owner'));

alter table public.profiles
  add column if not exists homestay_owner_id uuid;

-- Homestay owners (admin-provisioned, like hosts)
create table if not exists public.homestay_owners (
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

drop trigger if exists trg_homestay_owners_updated on public.homestay_owners;
create trigger trg_homestay_owners_updated
  before update on public.homestay_owners
  for each row execute procedure public.set_updated_at();

alter table public.profiles
  drop constraint if exists profiles_homestay_owner_id_fkey;
alter table public.profiles
  add constraint profiles_homestay_owner_id_fkey
  foreign key (homestay_owner_id) references public.homestay_owners (id) on delete set null;

-- Property types enum via check constraint
create table if not exists public.homestays (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.homestay_owners (id) on delete cascade,
  slug text not null unique,
  title text not null,
  tagline text,
  description text,
  property_type text not null check (property_type in (
    'Home Stay', 'Resort', 'Hotel'
  )),
  license_certificate_url text,
  city_slug text references public.cities (slug),
  city text not null,
  region text,
  address text,
  map_link text,
  amenities text[] not null default '{}',
  house_rules text[] not null default '{}',
  check_in_time time not null default '14:00',
  check_out_time time not null default '11:00',
  hero_image_url text,
  gallery_urls text[] not null default '{}',
  video_urls text[] not null default '{}',
  price_per_night_minor integer not null default 0,
  currency_code text not null default 'INR',
  bedrooms integer not null default 1,
  bathrooms integer not null default 1,
  max_guests integer not null default 2,
  extra_bed_available boolean not null default false,
  extra_bed_price_per_night_minor integer not null default 0,
  weekend_extra_bed_price_per_night_minor integer not null default 0,
  extra_beds_per_room integer not null default 1 check (extra_beds_per_room in (1, 2)),
  rating_avg numeric(3,2) not null default 0,
  reviews_count integer not null default 0,
  status text not null default 'draft'
    check (status in ('draft', 'pending_review', 'published', 'rejected', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_homestays_owner on public.homestays (owner_id);
create index if not exists idx_homestays_city on public.homestays (city_slug);
create index if not exists idx_homestays_status on public.homestays (status);

drop trigger if exists trg_homestays_updated on public.homestays;
create trigger trg_homestays_updated
  before update on public.homestays
  for each row execute procedure public.set_updated_at();

-- Room inventory (optional multi-room properties)
create table if not exists public.homestay_rooms (
  id uuid primary key default gen_random_uuid(),
  homestay_id uuid not null references public.homestays (id) on delete cascade,
  name text not null,
  category text,
  capacity integer not null default 2,
  price_per_night_minor integer not null,
  total_units integer not null default 1,
  extra_bed_available boolean not null default false,
  extra_bed_price_per_night_minor integer not null default 0,
  weekend_extra_bed_price_per_night_minor integer not null default 0,
  extra_beds_per_room integer not null default 1 check (extra_beds_per_room in (1, 2)),
  amenities text[] not null default '{}',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_homestay_rooms_homestay on public.homestay_rooms (homestay_id);

-- Calendar: blocked dates, seasonal / weekend pricing overrides
create table if not exists public.homestay_availability (
  id uuid primary key default gen_random_uuid(),
  homestay_id uuid not null references public.homestays (id) on delete cascade,
  room_id uuid references public.homestay_rooms (id) on delete cascade,
  date date not null,
  is_blocked boolean not null default false,
  price_override_minor integer,
  extra_bed_price_override_minor integer,
  min_nights integer,
  note text,
  unique (homestay_id, room_id, date)
);

create index if not exists idx_homestay_availability_date on public.homestay_availability (homestay_id, date);

-- Homestay bookings (check-in / check-out date range)
create table if not exists public.homestay_bookings (
  id uuid primary key default gen_random_uuid(),
  homestay_id uuid not null references public.homestays (id) on delete restrict,
  room_id uuid references public.homestay_rooms (id) on delete restrict,
  guest_id uuid not null references public.profiles (id) on delete restrict,
  check_in date not null,
  check_out date not null,
  guest_count integer not null default 1,
  room_count integer not null default 1,
  extra_bed_count integer not null default 0,
  nights integer generated always as (check_out - check_in) stored,
  subtotal_minor integer not null,
  platform_fee_minor integer not null default 0,
  host_payout_minor integer not null default 0,
  total_amount integer not null,
  currency_code text not null default 'INR',
  booking_status text not null default 'pending'
    check (booking_status in ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'refunded', 'failed')),
  payment_method text not null default 'cod'
    check (payment_method in ('cod', 'razorpay', 'stripe')),
  notes text,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out > check_in)
);

create index if not exists idx_homestay_bookings_guest on public.homestay_bookings (guest_id);
create index if not exists idx_homestay_bookings_homestay on public.homestay_bookings (homestay_id);
create index if not exists idx_homestay_bookings_dates on public.homestay_bookings (check_in, check_out);

-- Homestay reviews (moderated separately from experience reviews)
create table if not exists public.homestay_reviews (
  id uuid primary key default gen_random_uuid(),
  homestay_id uuid not null references public.homestays (id) on delete cascade,
  booking_id uuid references public.homestay_bookings (id) on delete set null,
  guest_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  status text not null default 'pending'
    check (status in ('pending', 'published', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (booking_id)
);

-- RLS: public read published homestays; writes via service role (backend API)
alter table public.homestay_owners enable row level security;
alter table public.homestays enable row level security;
alter table public.homestay_rooms enable row level security;
alter table public.homestay_availability enable row level security;
alter table public.homestay_bookings enable row level security;
alter table public.homestay_reviews enable row level security;

drop policy if exists "Public read published homestays" on public.homestays;
create policy "Public read published homestays"
  on public.homestays for select
  using (status = 'published');

drop policy if exists "Guests read own homestay bookings" on public.homestay_bookings;
create policy "Guests read own homestay bookings"
  on public.homestay_bookings for select
  to authenticated
  using (guest_id = auth.uid());

drop policy if exists "Public read published homestay reviews" on public.homestay_reviews;
create policy "Public read published homestay reviews"
  on public.homestay_reviews for select
  using (status = 'published');

-- Safe re-run: add room extra-bed + booking columns on existing databases
alter table public.homestay_rooms
  add column if not exists extra_bed_available boolean not null default false;
alter table public.homestay_rooms
  add column if not exists extra_bed_price_per_night_minor integer not null default 0;
alter table public.homestay_rooms
  add column if not exists weekend_extra_bed_price_per_night_minor integer not null default 0;
alter table public.homestay_bookings
  add column if not exists room_count integer not null default 1;
alter table public.homestay_bookings
  add column if not exists extra_bed_count integer not null default 0;

alter table public.homestays
  add column if not exists extra_bed_available boolean not null default false;
alter table public.homestays
  add column if not exists extra_bed_price_per_night_minor integer not null default 0;
alter table public.homestays
  add column if not exists weekend_extra_bed_price_per_night_minor integer not null default 0;
alter table public.homestays
  add column if not exists extra_beds_per_room integer not null default 1;
alter table public.homestay_rooms
  add column if not exists extra_beds_per_room integer not null default 1;
alter table public.homestay_availability
  add column if not exists extra_bed_price_override_minor integer;

-- ---------------------------------------------------------------------------
insert into public.homestay_owners (id, full_name, email, phone, address, approval_status, verified) values
  ('a0000001-0000-4000-8000-000000000001', 'Royal Heritage Stays', 'heritage@royalpassage.demo', '+91 9000000001', 'Mysuru, Karnataka', 'approved', true),
  ('a0000002-0000-4000-8000-000000000002', 'Mysuru Villa Collection', 'villas@royalpassage.demo', '+91 9000000002', 'Chamundi Hill Road, Mysuru', 'approved', true)
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  address = excluded.address;

insert into public.homestays (
  id, owner_id, slug, title, tagline, description, property_type, city_slug, city, region, address,
  amenities, house_rules, check_in_time, check_out_time, hero_image_url, gallery_urls,
  price_per_night_minor, currency_code, bedrooms, bathrooms, max_guests, rating_avg, reviews_count, status
) values
  (
    'b0000001-0000-4000-8000-000000000001',
    'a0000001-0000-4000-8000-000000000001',
    'heritage-haveli-mysuru',
    'Heritage Haveli Mysuru',
    'Wake to palace views and courtyard chai',
    'A restored century-old haveli steps from Mysuru Palace. Hand-carved pillars, private courtyard, and hosts who share family recipes and royal history.',
    'Home Stay', 'mysuru', 'Mysuru', 'Karnataka', 'Near Devaraja Market, Mysuru',
    array['WiFi', 'Breakfast', 'Garden', 'Parking', 'AC'],
    array['No smoking indoors', 'Quiet hours after 10 PM'],
    '14:00', '11:00',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    array[
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80'
    ],
    450000, 'INR', 3, 2, 6, 4.80, 56, 'published'
  ),
  (
    'b0000002-0000-4000-8000-000000000002',
    'a0000002-0000-4000-8000-000000000002',
    'chamundi-hills-villa',
    'Chamundi Hills Villa',
    'Palace views, gardens, and quiet mornings',
    'A serene villa at the Chamundi foothills with terraced gardens, glimpses of the palace skyline, and hosts who know every corner of Mysuru.',
    'Resort', 'mysuru', 'Mysuru', 'Karnataka', 'Chamundi Hill Road, Mysuru',
    array['WiFi', 'Kitchen', 'Garden', 'Parking', 'Breakfast', 'AC'],
    array[]::text[],
    '15:00', '11:00',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
    array[
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80'
    ],
    620000, 'INR', 2, 2, 4, 4.90, 41, 'published'
  ),
  (
    'b0000003-0000-4000-8000-000000000003',
    'a0000001-0000-4000-8000-000000000001',
    'royal-passage-guest-house',
    'Royal Passage Guest House',
    'Boutique rooms curated for discerning travellers',
    'A small guest house with Royal Passage hospitality standards — premium linens, local art, and concierge support for experiences and dining.',
    'Hotel', 'mysuru', 'Mysuru', 'Karnataka', 'Saraswathipuram, Mysuru',
    array['WiFi', 'AC', 'TV', 'Security', 'Breakfast', 'Parking'],
    array[]::text[],
    '13:00', '10:00',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',
    array[
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80'
    ],
    380000, 'INR', 4, 4, 8, 4.70, 29, 'published'
  )
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  tagline = excluded.tagline,
  description = excluded.description,
  property_type = excluded.property_type,
  city_slug = excluded.city_slug,
  city = excluded.city,
  address = excluded.address,
  amenities = excluded.amenities,
  status = excluded.status,
  hero_image_url = excluded.hero_image_url,
  price_per_night_minor = excluded.price_per_night_minor;

insert into public.homestay_rooms (
  id, homestay_id, name, category, capacity, price_per_night_minor, total_units,
  extra_bed_available, extra_bed_price_per_night_minor, weekend_extra_bed_price_per_night_minor, sort_order
) values
  ('c0000001-0000-4000-8000-000000000001', 'b0000001-0000-4000-8000-000000000001', 'Courtyard Suite', 'Suite', 2, 450000, 2, true, 80000, 80000, 0),
  ('c0000002-0000-4000-8000-000000000002', 'b0000002-0000-4000-8000-000000000002', 'Garden View Suite', 'Suite', 2, 620000, 3, true, 100000, 100000, 0),
  ('c0000003-0000-4000-8000-000000000003', 'b0000003-0000-4000-8000-000000000003', 'Deluxe Double', 'Deluxe', 2, 380000, 4, false, 0, 0, 0)
on conflict (id) do update set
  extra_bed_available = excluded.extra_bed_available,
  extra_bed_price_per_night_minor = excluded.extra_bed_price_per_night_minor,
  weekend_extra_bed_price_per_night_minor = excluded.weekend_extra_bed_price_per_night_minor;
