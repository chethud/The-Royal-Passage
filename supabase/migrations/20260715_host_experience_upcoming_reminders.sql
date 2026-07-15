-- Host countdown emails/notifications before an upcoming experience slot
-- (10 / 5 / 4 / 3 / 2 / 1 days before the experience date).

alter table public.bookings
  add column if not exists host_upcoming_reminders jsonb not null default '{}'::jsonb;

comment on column public.bookings.host_upcoming_reminders is
  'Map of day-buckets already emailed to the host, e.g. {"10":"…","5":"…","1":"…"}';

create index if not exists idx_bookings_confirmed_upcoming_reminders
  on public.bookings (booking_status)
  where booking_status = 'confirmed';
