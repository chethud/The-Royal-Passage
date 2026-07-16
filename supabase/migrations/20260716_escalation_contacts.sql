create table if not exists public.escalation_contacts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role_scope text not null check (role_scope in ('host', 'homestay_owner', 'vip_owner')),
  member_name text not null,
  member_email text not null,
  member_mobile text not null,
  designation text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_escalation_contacts_profile_role
  on public.escalation_contacts (profile_id, role_scope, sort_order);

drop trigger if exists trg_escalation_contacts_updated on public.escalation_contacts;
create trigger trg_escalation_contacts_updated
  before update on public.escalation_contacts
  for each row execute procedure public.set_updated_at();

alter table public.escalation_contacts enable row level security;

drop policy if exists "escalation_contacts_select_own" on public.escalation_contacts;
create policy "escalation_contacts_select_own"
  on public.escalation_contacts for select to authenticated
  using (auth.uid() = profile_id);

drop policy if exists "escalation_contacts_insert_own" on public.escalation_contacts;
create policy "escalation_contacts_insert_own"
  on public.escalation_contacts for insert to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "escalation_contacts_update_own" on public.escalation_contacts;
create policy "escalation_contacts_update_own"
  on public.escalation_contacts for update to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

drop policy if exists "escalation_contacts_delete_own" on public.escalation_contacts;
create policy "escalation_contacts_delete_own"
  on public.escalation_contacts for delete to authenticated
  using (auth.uid() = profile_id);
