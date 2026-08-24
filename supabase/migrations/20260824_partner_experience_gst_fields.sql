-- GST percent + GSTIN on partner experience applications.
-- GST number is required only when gst_percent > 0.

alter table public.partner_experience_applications
  add column if not exists gst_percent numeric(5, 2) not null default 0
    check (gst_percent >= 0 and gst_percent <= 100),
  add column if not exists gst_number text;

-- Replace earlier rupee-amount column if that draft was already applied.
alter table public.partner_experience_applications
  drop column if exists gst_amount_minor;
