-- Weekday vs weekend nightly rates for homestays and room types.
-- price_per_night_minor remains the weekday rate (Mon–Fri).
-- weekend_price_per_night_minor applies to Saturday and Sunday; null = same as weekday.

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
