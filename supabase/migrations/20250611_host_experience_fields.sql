-- Host experience management fields (Sprint 4)

alter table public.experiences
  add column if not exists requirements text[] not null default '{}',
  add column if not exists min_guests_per_booking int not null default 1
    check (min_guests_per_booking >= 1),
  add column if not exists max_guests_per_booking int not null default 10
    check (max_guests_per_booking >= 1);
