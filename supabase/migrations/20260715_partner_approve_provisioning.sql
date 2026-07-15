-- Partner approve provisioning: link created accounts/listings + homestay applications.

alter table public.partner_experience_applications
  add column if not exists created_user_id uuid references auth.users (id) on delete set null,
  add column if not exists created_experience_id uuid references public.experiences (id) on delete set null;

create table if not exists public.partner_homestay_applications (
  id uuid primary key default gen_random_uuid(),
  -- Applicant
  full_name text not null,
  email text not null,
  phone text not null,
  bio text,
  city text not null,
  fssai_id text,
  pan_number text,
  passport_photo_url text,
  gst_number text,
  -- Property details
  title text not null,
  tagline text,
  description text not null,
  property_type text not null default 'Home Stay',
  region text,
  address text not null,
  map_link text,
  price_per_night_minor integer not null check (price_per_night_minor > 0),
  weekend_price_per_night_minor integer,
  hero_image_url text,
  gallery_urls text[] not null default '{}',
  amenities text[] not null default '{}',
  house_rules text[] not null default '{}',
  bedrooms integer not null default 1 check (bedrooms >= 1),
  bathrooms integer not null default 1 check (bathrooms >= 1),
  max_guests integer not null default 2 check (max_guests >= 1),
  check_in_time text not null default '14:00',
  check_out_time text not null default '11:00',
  extra_bed_available boolean not null default false,
  extra_bed_price_per_night_minor integer not null default 0,
  weekend_extra_bed_price_per_night_minor integer not null default 0,
  extra_beds_per_room integer not null default 1,
  license_certificate_url text not null,
  -- Workflow
  status text not null default 'pending',
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  admin_notes text,
  created_user_id uuid references auth.users (id) on delete set null,
  created_homestay_id uuid references public.homestays (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partner_homestay_applications_status_check
    check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists idx_partner_homestay_applications_status_created
  on public.partner_homestay_applications (status, created_at desc);

alter table public.partner_homestay_applications enable row level security;

revoke all on table public.partner_homestay_applications from anon, authenticated;
grant select, insert, update, delete on table public.partner_homestay_applications to service_role;

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check check (type in (
    'booking_created', 'booking_confirmed', 'booking_cancelled',
    'booking_reminder', 'review_request', 'host_approved', 'review_received',
    'experience_submitted', 'homestay_submitted', 'account_welcome',
    'booking_pending_overdue', 'partner_experience_application',
    'partner_homestay_application'
  ));
