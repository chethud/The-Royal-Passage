-- Client contact on homestay bookings (travel agents book on behalf of guests).

alter table public.homestay_bookings
  add column if not exists guest_name text,
  add column if not exists guest_email text,
  add column if not exists guest_phone text;
