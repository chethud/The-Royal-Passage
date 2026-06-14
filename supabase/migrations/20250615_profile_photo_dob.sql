-- Optional profile photo URL and date of birth for all account roles.

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists date_of_birth date;

comment on column public.profiles.avatar_url is 'Public URL for the user profile photo.';
comment on column public.profiles.date_of_birth is 'Optional date of birth (YYYY-MM-DD).';
