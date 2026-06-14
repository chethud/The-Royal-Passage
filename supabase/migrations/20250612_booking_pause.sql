-- Allow hosts to temporarily pause confirmed bookings without cancelling.
alter table public.bookings
  add column if not exists is_paused boolean not null default false,
  add column if not exists paused_at timestamptz;

create index if not exists idx_bookings_is_paused on public.bookings (is_paused)
  where is_paused = true;
