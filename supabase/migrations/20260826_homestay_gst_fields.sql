-- GST percent on partner homestay applications and published homestays.
-- GSTIN required only when gst_percent > 0.
-- Checkout: total = subtotal + round(subtotal * gst_percent / 100).

alter table public.partner_homestay_applications
  add column if not exists gst_percent numeric(5, 2) not null default 0
    check (gst_percent >= 0 and gst_percent <= 100);

alter table public.homestays
  add column if not exists gst_percent numeric(5, 2) not null default 0
    check (gst_percent >= 0 and gst_percent <= 100),
  add column if not exists gst_number text;
