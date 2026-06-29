-- =============================================================================
-- Incremental patch — run this if FULL_SCHEMA.sql fails with "Failed to fetch"
-- Safe to re-run. Use when the dashboard times out on the full 1,800+ line file.
-- =============================================================================

-- Notification types (welcome email + homestay admin alerts)
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check check (type in (
    'booking_created', 'booking_confirmed', 'booking_cancelled',
    'booking_reminder', 'review_request', 'host_approved', 'review_received',
    'experience_submitted', 'homestay_submitted', 'account_welcome'
  ));

-- Host booking email tracking (instant + 15m / 2h / 24h reminders)
alter table public.bookings
  add column if not exists host_request_email_sent_at timestamptz,
  add column if not exists host_reminder_15m_at timestamptz,
  add column if not exists host_reminder_2h_at timestamptz,
  add column if not exists host_reminder_24h_at timestamptz;

alter table public.homestay_bookings
  add column if not exists host_request_email_sent_at timestamptz,
  add column if not exists host_reminder_15m_at timestamptz,
  add column if not exists host_reminder_2h_at timestamptz,
  add column if not exists host_reminder_24h_at timestamptz;

create index if not exists idx_bookings_pending_host_reminders
  on public.bookings (created_at)
  where booking_status = 'pending';

create index if not exists idx_homestay_bookings_pending_host_reminders
  on public.homestay_bookings (created_at)
  where booking_status = 'pending';

-- Weekend homestay pricing (only if homestay tables exist)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'homestays'
  ) then
    alter table public.homestays
      add column if not exists weekend_price_per_night_minor integer;
    update public.homestays
    set weekend_price_per_night_minor = price_per_night_minor
    where weekend_price_per_night_minor is null;
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'homestay_rooms'
  ) then
    alter table public.homestay_rooms
      add column if not exists weekend_price_per_night_minor integer;
    update public.homestay_rooms
    set weekend_price_per_night_minor = price_per_night_minor
    where weekend_price_per_night_minor is null;
  end if;
end $$;

-- VIP bookings legacy column rename (only if old column exists)
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

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'vip_bookings'
  ) and not exists (
    select 1 from pg_constraint
    where conname = 'vip_bookings_package_id_fkey'
      and conrelid = 'public.vip_bookings'::regclass
  ) then
    alter table public.vip_bookings
      add constraint vip_bookings_package_id_fkey
      foreign key (package_id) references public.vip_packages (id) on delete restrict;
  end if;
end $$;
