-- Sprint 5: reviews enhancements, notifications, audit logs

alter table public.reviews
  add column if not exists guest_id uuid references public.profiles (id) on delete set null,
  add column if not exists host_reply text,
  add column if not exists host_replied_at timestamptz,
  add column if not exists is_verified boolean not null default false,
  add column if not exists status text not null default 'published'
    check (status in ('published', 'hidden', 'flagged'));

create index if not exists idx_reviews_guest on public.reviews (guest_id);
create index if not exists idx_reviews_status on public.reviews (status);

create or replace function public.refresh_experience_rating()
returns trigger
language plpgsql
as $$
declare
  v_exp_id uuid;
begin
  v_exp_id := coalesce(new.experience_id, old.experience_id);
  update public.experiences e
  set
    average_rating = coalesce((
      select round(avg(r.rating)::numeric, 2)
      from public.reviews r
      where r.experience_id = v_exp_id and r.status = 'published'
    ), 0),
    review_count = (
      select count(*)::int
      from public.reviews r
      where r.experience_id = v_exp_id and r.status = 'published'
    )
  where e.id = v_exp_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_reviews_rating on public.reviews;
create trigger trg_reviews_rating
  after insert or update or delete on public.reviews
  for each row execute procedure public.refresh_experience_rating();

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in (
    'booking_created', 'booking_confirmed', 'booking_cancelled',
    'booking_reminder', 'review_request', 'host_approved', 'review_received'
  )),
  title text not null,
  body text not null,
  metadata jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications (user_id, created_at desc);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_created on public.audit_logs (created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_own" on public.notifications;
create policy "notifications_own"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());
