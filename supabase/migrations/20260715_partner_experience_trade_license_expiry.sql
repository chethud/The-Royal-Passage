-- Trade licence expiry on partner experience applications.

alter table public.partner_experience_applications
  add column if not exists trade_license_expires_on date;
