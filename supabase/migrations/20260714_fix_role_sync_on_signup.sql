-- Keep signup guest profile + user_roles in sync, and allow staff role reads.

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
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      nullif(split_part(new.email, '@', 1), ''),
      'Guest'
    ),
    new.raw_user_meta_data->>'phone',
    'guest'
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'guest')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

-- Ensure authenticated users can always read their own role rows.
drop policy if exists "Users can read own roles" on public.user_roles;
create policy "Users can read own roles"
  on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id);
