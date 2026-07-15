-- Once-per-booking flag: admin bell when still pending after 1 hour.
alter table public.bookings
  add column if not exists admin_pending_1h_notified_at timestamptz;

alter table public.homestay_bookings
  add column if not exists admin_pending_1h_notified_at timestamptz;

create index if not exists idx_bookings_pending_admin_1h
  on public.bookings (created_at)
  where booking_status = 'pending' and admin_pending_1h_notified_at is null;

create index if not exists idx_homestay_bookings_pending_admin_1h
  on public.homestay_bookings (created_at)
  where booking_status = 'pending' and admin_pending_1h_notified_at is null;
