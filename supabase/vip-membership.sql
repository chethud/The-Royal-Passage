-- ---------------------------------------------------------------------------
-- VIP MEMBERSHIP — guest applications, custom package requests, profile flags
-- Run after supabase/vip-module.sql
--
-- Idempotent: safe on fresh databases and on upgrades from older membership
-- schema (passport/visitor/business ID types without photo upload).
-- ---------------------------------------------------------------------------

-- Guest VIP membership state on profile
alter table public.profiles
  add column if not exists vip_membership_status text not null default 'none';

alter table public.profiles
  drop constraint if exists profiles_vip_membership_status_check;

alter table public.profiles
  add constraint profiles_vip_membership_status_check
  check (vip_membership_status in ('none', 'skipped', 'pending', 'approved', 'rejected'));

-- Membership applications (Aadhaar + photo required for new submissions)
create table if not exists public.vip_membership_applications (
  id uuid primary key default gen_random_uuid(),
  guest_user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  address text,
  id_document_type text not null default 'aadhaar',
  id_document_number text not null,
  id_document_photo_url text not null,
  status text not null default 'pending',
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Upgrade columns added after initial membership rollout
alter table public.vip_membership_applications
  add column if not exists address text;

alter table public.vip_membership_applications
  add column if not exists id_document_photo_url text;

alter table public.vip_membership_applications
  alter column id_document_type set default 'aadhaar';

-- Aadhaar only — remove passport / visitor / business ID options
update public.vip_membership_applications
  set id_document_type = 'aadhaar'
  where id_document_type is distinct from 'aadhaar';

alter table public.vip_membership_applications
  drop constraint if exists vip_membership_applications_id_document_type_check;

alter table public.vip_membership_applications
  add constraint vip_membership_applications_id_document_type_check
  check (id_document_type = 'aadhaar');

alter table public.vip_membership_applications
  drop constraint if exists vip_membership_applications_status_check;

alter table public.vip_membership_applications
  add constraint vip_membership_applications_status_check
  check (status in ('pending', 'approved', 'rejected'));

create unique index if not exists idx_vip_membership_applications_guest
  on public.vip_membership_applications (guest_user_id);

create index if not exists idx_vip_membership_applications_status
  on public.vip_membership_applications (status);

drop trigger if exists trg_vip_membership_applications_updated on public.vip_membership_applications;
create trigger trg_vip_membership_applications_updated
  before update on public.vip_membership_applications
  for each row execute procedure public.set_updated_at();

-- Approved members: bespoke package requests
create table if not exists public.vip_custom_package_requests (
  id uuid primary key default gen_random_uuid(),
  guest_user_id uuid not null references auth.users (id) on delete cascade,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  travel_start date not null,
  travel_end date not null,
  guest_count integer not null default 1 check (guest_count >= 1),
  preferences text,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vip_custom_package_requests
  drop constraint if exists vip_custom_package_requests_status_check;

alter table public.vip_custom_package_requests
  add constraint vip_custom_package_requests_status_check
  check (status in ('pending', 'in_progress', 'completed', 'rejected'));

create index if not exists idx_vip_custom_package_requests_guest
  on public.vip_custom_package_requests (guest_user_id);

create index if not exists idx_vip_custom_package_requests_status
  on public.vip_custom_package_requests (status);

drop trigger if exists trg_vip_custom_package_requests_updated on public.vip_custom_package_requests;
create trigger trg_vip_custom_package_requests_updated
  before update on public.vip_custom_package_requests
  for each row execute procedure public.set_updated_at();

-- Note: id_document_photo_url stays nullable on upgraded rows that pre-date photo
-- upload. The app requires a photo for every new application. Reject or delete
-- legacy pending rows without a photo so guests can re-apply with Aadhaar image.
