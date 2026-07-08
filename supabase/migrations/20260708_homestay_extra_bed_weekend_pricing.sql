alter table public.homestays
  add column if not exists weekend_extra_bed_price_per_night_minor integer not null default 0;

update public.homestays
set weekend_extra_bed_price_per_night_minor = extra_bed_price_per_night_minor
where weekend_extra_bed_price_per_night_minor = 0
  and extra_bed_price_per_night_minor > 0;

alter table public.homestay_rooms
  add column if not exists weekend_extra_bed_price_per_night_minor integer not null default 0;

update public.homestay_rooms
set weekend_extra_bed_price_per_night_minor = extra_bed_price_per_night_minor
where weekend_extra_bed_price_per_night_minor = 0
  and extra_bed_price_per_night_minor > 0;
