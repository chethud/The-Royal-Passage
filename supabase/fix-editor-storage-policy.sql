-- Run in Supabase Dashboard → SQL Editor if editor photo upload fails with RLS errors.
-- Note: the app uploads via the server (service role) by default, so this is optional.

drop policy if exists "Editors upload homepage photos" on storage.objects;

create policy "Editors upload homepage photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'experience-photos'
    and (storage.foldername(name))[1] = 'homepage'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'editor'
    )
  );
