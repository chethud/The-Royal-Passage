-- Repair staff accounts left as guest after provisioning races.

-- Restore profiles.role from linked provider rows when still stuck as guest.
update public.profiles p
set role = case
  when p.host_id is not null then 'host'
  when p.homestay_owner_id is not null then 'homestay_owner'
  when p.vip_owner_id is not null then 'vip_owner'
  else p.role
end
where p.role = 'guest'
  and (
    p.host_id is not null
    or p.homestay_owner_id is not null
    or p.vip_owner_id is not null
  );

-- Ensure user_roles contains every linked provider role.
insert into public.user_roles (user_id, role)
select p.id, 'host'
from public.profiles p
where p.host_id is not null
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select p.id, 'homestay_owner'
from public.profiles p
where p.homestay_owner_id is not null
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select p.id, 'vip_owner'
from public.profiles p
where p.vip_owner_id is not null
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select p.id, p.role
from public.profiles p
where p.role in ('admin', 'editor', 'host', 'homestay_owner', 'vip_owner')
on conflict (user_id, role) do nothing;

-- Drop leftover guest role once any staff role exists.
delete from public.user_roles ur
where ur.role = 'guest'
  and exists (
    select 1
    from public.user_roles other
    where other.user_id = ur.user_id
      and other.role <> 'guest'
  );
