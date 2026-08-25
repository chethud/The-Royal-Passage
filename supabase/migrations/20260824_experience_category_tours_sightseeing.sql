-- Add Tours & Sightseeing to experience categories.

insert into public.experience_categories (slug, label, sort_order) values
  ('tours_sightseeing', 'Tours & Sightseeing', 90)
on conflict (slug) do update
set
  label = excluded.label,
  sort_order = excluded.sort_order;
