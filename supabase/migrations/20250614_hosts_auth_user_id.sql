-- Link hosts to Supabase Auth users (required for admin-created host logins)
alter table public.hosts
  add column if not exists auth_user_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'hosts_auth_user_id_fkey'
  ) then
    alter table public.hosts
      add constraint hosts_auth_user_id_fkey
      foreign key (auth_user_id) references auth.users (id) on delete set null;
  end if;
end $$;

create unique index if not exists idx_hosts_auth_user_id on public.hosts (auth_user_id)
  where auth_user_id is not null;
