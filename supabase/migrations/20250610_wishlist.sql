-- Guest wishlist (saved experiences)

create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.profiles (id) on delete cascade,
  experience_id uuid not null references public.experiences (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint uq_wishlist_guest_experience unique (guest_id, experience_id)
);

create index if not exists idx_wishlist_guest on public.wishlist (guest_id);
create index if not exists idx_wishlist_experience on public.wishlist (experience_id);

alter table public.wishlist enable row level security;

drop policy if exists "wishlist_own" on public.wishlist;

create policy "wishlist_own"
  on public.wishlist for all to authenticated
  using (guest_id = auth.uid())
  with check (guest_id = auth.uid());
