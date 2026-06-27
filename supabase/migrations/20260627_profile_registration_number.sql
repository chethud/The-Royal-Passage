-- Royal passport registration number — assigned once at profile creation.

alter table public.profiles
  add column if not exists registration_number text;

create unique index if not exists profiles_registration_number_key
  on public.profiles (registration_number)
  where registration_number is not null;

create or replace function public.generate_registration_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
begin
  loop
    candidate := lpad((floor(random() * 10000000))::text, 7, '0');
    exit when not exists (
      select 1 from public.profiles where registration_number = candidate
    );
  end loop;
  return candidate;
end;
$$;

create or replace function public.set_profile_registration_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.registration_number is null or btrim(new.registration_number) = '' then
    new.registration_number := public.generate_registration_number();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_registration_number on public.profiles;
create trigger trg_profiles_registration_number
  before insert on public.profiles
  for each row execute procedure public.set_profile_registration_number();

-- Backfill existing profiles.
update public.profiles
set registration_number = public.generate_registration_number()
where registration_number is null;

alter table public.profiles
  alter column registration_number set not null;

comment on column public.profiles.registration_number is
  'Seven-digit royal passport registration number; assigned at account creation.';
