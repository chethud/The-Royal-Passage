-- Travel agent module: applications, agent profiles, and agent booking metadata.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in (
    'guest', 'host', 'admin', 'editor', 'homestay_owner', 'vip_owner', 'travel_agent'
  ));

alter table public.profiles
  add column if not exists travel_agent_id uuid;

create table if not exists public.travel_agents (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  city text,
  address text,
  gst_number text,
  pan_number text,
  gst_certificate_url text,
  company_registration_url text,
  passport_photo_url text,
  discount_percent numeric(5, 2) not null default 0
    check (discount_percent >= 0 and discount_percent <= 100),
  approval_status text not null default 'approved'
    check (approval_status in ('pending', 'approved', 'rejected', 'suspended')),
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_travel_agents_updated on public.travel_agents;
create trigger trg_travel_agents_updated
  before update on public.travel_agents
  for each row execute procedure public.set_updated_at();

alter table public.profiles
  drop constraint if exists profiles_travel_agent_id_fkey;
alter table public.profiles
  add constraint profiles_travel_agent_id_fkey
  foreign key (travel_agent_id) references public.travel_agents (id) on delete set null;

create table if not exists public.partner_travel_agent_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  bio text,
  city text not null,
  company_name text not null,
  company_address text not null,
  gst_number text not null,
  pan_number text not null,
  gst_certificate_url text,
  company_registration_url text,
  passport_photo_url text not null,
  status text not null default 'pending',
  admin_discount_percent numeric(5, 2)
    check (admin_discount_percent is null or (admin_discount_percent >= 0 and admin_discount_percent <= 100)),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  admin_notes text,
  created_user_id uuid references auth.users (id) on delete set null,
  created_travel_agent_id uuid references public.travel_agents (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partner_travel_agent_applications_status_check
    check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists idx_partner_travel_agent_applications_status_created
  on public.partner_travel_agent_applications (status, created_at desc);

alter table public.partner_travel_agent_applications enable row level security;
revoke all on table public.partner_travel_agent_applications from anon, authenticated;
grant select, insert, update, delete on table public.partner_travel_agent_applications to service_role;

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check check (type in (
    'booking_created', 'booking_confirmed', 'booking_cancelled',
    'booking_reminder', 'review_request', 'host_approved', 'review_received',
    'experience_submitted', 'homestay_submitted', 'account_welcome',
    'booking_pending_overdue', 'partner_experience_application',
    'partner_homestay_application', 'partner_travel_agent_application'
  ));

-- Agent booking metadata on experience bookings.
alter table public.bookings
  add column if not exists travel_agent_id uuid references public.travel_agents (id) on delete set null,
  add column if not exists agent_markup_minor integer not null default 0
    check (agent_markup_minor >= 0),
  add column if not exists agent_discount_percent numeric(5, 2)
    check (agent_discount_percent is null or (agent_discount_percent >= 0 and agent_discount_percent <= 100)),
  add column if not exists client_send_confirmation boolean not null default false,
  add column if not exists client_email_include_price boolean not null default true;

alter table public.homestay_bookings
  add column if not exists travel_agent_id uuid references public.travel_agents (id) on delete set null,
  add column if not exists agent_markup_minor integer not null default 0
    check (agent_markup_minor >= 0),
  add column if not exists agent_discount_percent numeric(5, 2)
    check (agent_discount_percent is null or (agent_discount_percent >= 0 and agent_discount_percent <= 100)),
  add column if not exists client_send_confirmation boolean not null default false,
  add column if not exists client_email_include_price boolean not null default true;

create index if not exists idx_bookings_travel_agent on public.bookings (travel_agent_id, created_at desc);
create index if not exists idx_homestay_bookings_travel_agent
  on public.homestay_bookings (travel_agent_id, created_at desc);

insert into public.user_roles (user_id, role)
select p.id, 'travel_agent'
from public.profiles p
where p.travel_agent_id is not null
on conflict (user_id, role) do nothing;
