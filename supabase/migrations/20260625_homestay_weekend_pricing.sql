-- Weekday vs weekend nightly rates for homestays and room types.
-- price_per_night_minor remains the weekday rate (Mon–Fri).
-- weekend_price_per_night_minor applies to Saturday and Sunday; null = same as weekday.

alter table public.homestays
  add column if not exists weekend_price_per_night_minor integer;

alter table public.homestay_rooms
  add column if not exists weekend_price_per_night_minor integer;

update public.homestays
  set weekend_price_per_night_minor = price_per_night_minor
  where weekend_price_per_night_minor is null;

update public.homestay_rooms
  set weekend_price_per_night_minor = price_per_night_minor
  where weekend_price_per_night_minor is null;
