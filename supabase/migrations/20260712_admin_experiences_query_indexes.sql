-- Speed pending-review queues used by admin experiences / homestays.
create index if not exists idx_experiences_status_created
  on public.experiences (status, created_at desc);

create index if not exists idx_experiences_pending_review
  on public.experiences (created_at desc)
  where status = 'pending_review';

create index if not exists idx_bookings_status_created
  on public.bookings (booking_status, created_at desc);
