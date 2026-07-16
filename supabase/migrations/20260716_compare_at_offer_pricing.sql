-- Optional compare-at ("was") prices for catalog offers.
-- Guests always pay the existing selling-price columns; compare-at is display-only.

-- Experiences: original list price vs price_per_person_minor.
alter table public.experiences
  add column if not exists compare_at_price_per_person_minor integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'experiences_compare_at_price_per_person_minor_check'
  ) then
    alter table public.experiences
      add constraint experiences_compare_at_price_per_person_minor_check
      check (
        compare_at_price_per_person_minor is null
        or compare_at_price_per_person_minor > price_per_person_minor
      );
  end if;
end $$;

-- Homestays: property-level weekday / weekend list prices.
alter table public.homestays
  add column if not exists compare_at_price_per_night_minor integer;

alter table public.homestays
  add column if not exists compare_at_weekend_price_per_night_minor integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'homestays_compare_at_price_per_night_minor_check'
  ) then
    alter table public.homestays
      add constraint homestays_compare_at_price_per_night_minor_check
      check (
        compare_at_price_per_night_minor is null
        or compare_at_price_per_night_minor > price_per_night_minor
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'homestays_compare_at_weekend_price_per_night_minor_check'
  ) then
    alter table public.homestays
      add constraint homestays_compare_at_weekend_price_per_night_minor_check
      check (
        compare_at_weekend_price_per_night_minor is null
        or compare_at_weekend_price_per_night_minor
          > coalesce(weekend_price_per_night_minor, price_per_night_minor)
      );
  end if;
end $$;
