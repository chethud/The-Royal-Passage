-- Per-day extra bed price overrides on custom / holiday nights.
alter table public.homestay_availability
  add column if not exists extra_bed_price_override_minor integer;
