-- Phase 1: Pay-at-venue (COD) booking model
-- Run in Supabase SQL Editor after schema.sql

-- ---------------------------------------------------------------------------
-- New booking columns (COD model)
-- ---------------------------------------------------------------------------
alter table public.bookings
  add column if not exists experience_id uuid references public.experiences (id) on delete restrict,
  add column if not exists guest_id uuid references public.profiles (id) on delete set null,
  add column if not exists participant_count int,
  add column if not exists total_amount int,
  add column if not exists payment_method text not null default 'cod'
    check (payment_method in ('cod')),
  add column if not exists payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid')),
  add column if not exists booking_status text not null default 'pending'
    check (booking_status in ('pending', 'confirmed', 'completed', 'cancelled')),
  add column if not exists notes text,
  add column if not exists confirmed_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by text
    check (cancelled_by is null or cancelled_by in ('guest', 'host', 'admin'));

-- Backfill from legacy columns
update public.bookings
set
  participant_count = coalesce(participant_count, guest_count),
  total_amount = coalesce(total_amount, subtotal_minor),
  guest_id = coalesce(guest_id, customer_user_id),
  experience_id = coalesce(
    experience_id,
    (select es.experience_id from public.experience_slots es where es.id = bookings.slot_id)
  )
where participant_count is null
   or total_amount is null
   or experience_id is null;

update public.bookings
set booking_status = case
  when status in ('confirmed') then 'confirmed'
  when status in ('completed') then 'completed'
  when status like 'cancelled%' then 'cancelled'
  else 'pending'
end
where booking_status = 'pending' and status is not null and status <> 'pending_payment';

create index if not exists idx_bookings_guest on public.bookings (guest_id);
create index if not exists idx_bookings_experience on public.bookings (experience_id);
create index if not exists idx_bookings_booking_status on public.bookings (booking_status);
create index if not exists idx_bookings_payment_status on public.bookings (payment_status);

-- ---------------------------------------------------------------------------
-- Atomic seat reservation (prevents overbooking)
-- ---------------------------------------------------------------------------
create or replace function public.reserve_booking_seats(
  p_slot_id uuid,
  p_guest_count int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_available int;
begin
  if p_guest_count < 1 then
    return false;
  end if;

  select capacity - seats_sold into v_available
  from public.experience_slots
  where id = p_slot_id and not is_blocked
  for update;

  if v_available is null or v_available < p_guest_count then
    return false;
  end if;

  update public.experience_slots
  set seats_sold = seats_sold + p_guest_count
  where id = p_slot_id;

  return true;
end;
$$;

create or replace function public.release_booking_seats(
  p_slot_id uuid,
  p_guest_count int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.experience_slots
  set seats_sold = greatest(0, seats_sold - p_guest_count)
  where id = p_slot_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS: guests read own bookings
-- ---------------------------------------------------------------------------
drop policy if exists "bookings_select_own" on public.bookings;
drop policy if exists "bookings_select_host" on public.bookings;

create policy "bookings_select_own"
  on public.bookings for select to authenticated
  using (guest_id = auth.uid());

create policy "bookings_select_host"
  on public.bookings for select to authenticated
  using (
    exists (
      select 1
      from public.experiences e
      join public.hosts h on h.id = e.host_id
      where e.id = bookings.experience_id
        and h.auth_user_id = auth.uid()
    )
  );
