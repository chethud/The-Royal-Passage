-- ---------------------------------------------------------------------------
-- VIP MEMBERSHIP — guest applications, custom package requests, profile flags
-- Run after supabase/vip-module.sql
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists vip_membership_status text not null default 'none'
    check (vip_membership_status in ('none', 'skipped', 'pending', 'approved', 'rejected'));

create table if not exists public.vip_membership_applications (
  id uuid primary key default gen_random_uuid(),
  guest_user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  address text,
  id_document_type text not null
    check (id_document_type in ('aadhaar', 'visitor_id', 'business_id')),
  id_document_number text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_vip_membership_applications_guest
  on public.vip_membership_applications (guest_user_id);

create index if not exists idx_vip_membership_applications_status
  on public.vip_membership_applications (status);

drop trigger if exists trg_vip_membership_applications_updated on public.vip_membership_applications;
create trigger trg_vip_membership_applications_updated
  before update on public.vip_membership_applications
  for each row execute procedure public.set_updated_at();

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
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed', 'rejected')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vip_custom_package_requests_guest
  on public.vip_custom_package_requests (guest_user_id);

create index if not exists idx_vip_custom_package_requests_status
  on public.vip_custom_package_requests (status);

drop trigger if exists trg_vip_custom_package_requests_updated on public.vip_custom_package_requests;
create trigger trg_vip_custom_package_requests_updated
  before update on public.vip_custom_package_requests
  for each row execute procedure public.set_updated_at();
