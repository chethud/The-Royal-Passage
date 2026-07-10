-- Multi-role access: admins can assign multiple platform roles per user.

create table if not exists public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (
    role in ('guest', 'host', 'admin', 'editor', 'homestay_owner', 'vip_owner')
  ),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create index if not exists user_roles_role_idx on public.user_roles (role);

-- Backfill from existing single-role profiles.
insert into public.user_roles (user_id, role)
select id, role
from public.profiles
on conflict (user_id, role) do nothing;

alter table public.user_roles enable row level security;

drop policy if exists "Users can read own roles" on public.user_roles;
create policy "Users can read own roles"
  on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id);
