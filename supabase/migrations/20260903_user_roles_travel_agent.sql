-- Allow travel_agent in user_roles (required for seeded + approved agent logins).

alter table public.user_roles drop constraint if exists user_roles_role_check;
alter table public.user_roles add constraint user_roles_role_check
  check (role in (
    'guest', 'host', 'admin', 'editor', 'homestay_owner', 'vip_owner', 'travel_agent'
  ));
