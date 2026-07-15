-- Guest book+cancel abuse: freeze after >3 guest cancels in a calendar day (Asia/Kolkata).
-- First offense → 24h; subsequent offense days → 3 days.

alter table public.profiles
  add column if not exists booking_freeze_until timestamptz,
  add column if not exists booking_cancel_offense_count integer not null default 0;

comment on column public.profiles.booking_freeze_until is
  'When set and in the future, guest cannot create new bookings.';
comment on column public.profiles.booking_cancel_offense_count is
  'How many times this guest triggered a cancel-abuse freeze.';

create table if not exists public.guest_booking_cancel_events (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.profiles (id) on delete cascade,
  booking_kind text not null
    check (booking_kind in ('experience', 'homestay')),
  booking_id uuid not null,
  cancelled_at timestamptz not null default now()
);

create index if not exists guest_booking_cancel_events_guest_day_idx
  on public.guest_booking_cancel_events (guest_id, cancelled_at desc);

alter table public.guest_booking_cancel_events enable row level security;

-- Server role only (no client policies).
drop policy if exists "guest_cancel_events_deny_all" on public.guest_booking_cancel_events;
create policy "guest_cancel_events_deny_all"
  on public.guest_booking_cancel_events
  for all
  to authenticated, anon
  using (false)
  with check (false);

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check check (type in (
    'booking_created', 'booking_confirmed', 'booking_cancelled',
    'booking_reminder', 'review_request', 'host_approved', 'review_received',
    'experience_submitted', 'homestay_submitted', 'account_welcome',
    'booking_pending_overdue', 'partner_experience_application',
    'partner_homestay_application', 'booking_frozen'
  ));
