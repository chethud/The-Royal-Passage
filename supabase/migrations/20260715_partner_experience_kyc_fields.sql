-- Experience partner applicant KYC: PAN, passport photo, trade licence.

alter table public.partner_experience_applications
  add column if not exists pan_number text,
  add column if not exists passport_photo_url text,
  add column if not exists trade_license_url text,
  add column if not exists trade_license_expires_on date;
