-- Partner experience host applications (public form → admin Host requests queue).

create table if not exists public.partner_experience_applications (
  id uuid primary key default gen_random_uuid(),
  -- Applicant
  full_name text not null,
  email text not null,
  phone text not null,
  bio text,
  city text not null,
  -- Experience details
  title text not null,
  tagline text,
  description text not null,
  category_slug text not null,
  duration_minutes integer not null
    check (duration_minutes >= 30 and duration_minutes <= 480),
  price_per_person_minor integer not null
    check (price_per_person_minor > 0),
  min_guests integer not null default 1
    check (min_guests >= 1),
  max_guests integer not null
    check (max_guests >= 1),
  address text not null,
  region text,
  map_link text,
  hero_image_url text,
  gallery_urls text[] not null default '{}',
  inclusions text[] not null default '{}',
  exclusions text[] not null default '{}',
  requirements text[] not null default '{}',
  -- Workflow
  status text not null default 'pending',
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partner_experience_applications_status_check
    check (status in ('pending', 'approved', 'rejected')),
  constraint partner_experience_applications_guests_check
    check (max_guests >= min_guests)
);

-- Idempotent upgrades if an earlier draft of this migration already ran.
alter table public.partner_experience_applications
  add column if not exists region text,
  add column if not exists map_link text,
  add column if not exists hero_image_url text,
  add column if not exists gallery_urls text[] not null default '{}';

create index if not exists idx_partner_experience_applications_status_created
  on public.partner_experience_applications (status, created_at desc);

alter table public.partner_experience_applications enable row level security;

-- Locked to service-role / server functions only (no public RLS policies).
revoke all on table public.partner_experience_applications from anon, authenticated;
grant select, insert, update, delete on table public.partner_experience_applications to service_role;

-- Notification type for admin bell + Host requests strip.
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check check (type in (
    'booking_created', 'booking_confirmed', 'booking_cancelled',
    'booking_reminder', 'review_request', 'host_approved', 'review_received',
    'experience_submitted', 'homestay_submitted', 'account_welcome',
    'booking_pending_overdue', 'partner_experience_application'
  ));
