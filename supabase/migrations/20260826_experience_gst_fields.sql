-- GST percent on published experiences (copied from partner applications / host edits).
-- Applied as an add-on at checkout: total = subtotal + round(subtotal * gst_percent / 100).

alter table public.experiences
  add column if not exists gst_percent numeric(5, 2) not null default 0
    check (gst_percent >= 0 and gst_percent <= 100),
  add column if not exists gst_number text;
