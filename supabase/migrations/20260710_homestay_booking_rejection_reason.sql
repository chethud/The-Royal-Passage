alter table public.homestay_bookings
  add column if not exists rejection_reason text;
