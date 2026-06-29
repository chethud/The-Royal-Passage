-- Track host booking-request emails (initial + 15m / 2h / 24h reminders while still pending).

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
