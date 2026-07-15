-- Host/owner decision contact on accept/reject + experience rejection reason.

alter table public.bookings
  add column if not exists decision_by_name text,
  add column if not exists decision_by_phone text,
  add column if not exists rejection_reason text;

alter table public.homestay_bookings
  add column if not exists decision_by_name text,
  add column if not exists decision_by_phone text;
