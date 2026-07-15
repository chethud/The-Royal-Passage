-- Partner homestay applicant KYC / tax fields.

alter table public.partner_homestay_applications
  add column if not exists fssai_id text,
  add column if not exists pan_number text,
  add column if not exists passport_photo_url text,
  add column if not exists gst_number text;
