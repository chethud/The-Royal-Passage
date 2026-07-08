-- Limit property categories to Home Stay, Resort, Hotel.
-- Require a license/certificate URL when owners add properties.

do $$
declare
  constraint_name text;
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'homestays'
  ) then
    return;
  end if;

  alter table public.homestays
    add column if not exists license_certificate_url text;

  -- Remap retired categories onto the closest allowed type.
  update public.homestays
  set property_type = case property_type
    when 'Villa' then 'Home Stay'
    when 'Cottage' then 'Home Stay'
    when 'Farm House' then 'Home Stay'
    when 'Apartment' then 'Home Stay'
    when 'Guest House' then 'Hotel'
    when 'Luxury Stay' then 'Resort'
    else property_type
  end
  where property_type not in ('Home Stay', 'Resort', 'Hotel');

  for constraint_name in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'homestays'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%property_type%'
  loop
    execute format('alter table public.homestays drop constraint %I', constraint_name);
  end loop;

  alter table public.homestays
    add constraint homestays_property_type_check
    check (property_type in ('Home Stay', 'Resort', 'Hotel'));
end $$;
