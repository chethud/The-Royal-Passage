-- Guests self-register; host and admin accounts are created by admin only.

drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id and role = 'guest');

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (auth.uid() = id and role = 'guest')
  with check (auth.uid() = id and role = 'guest');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'phone',
    'guest'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
