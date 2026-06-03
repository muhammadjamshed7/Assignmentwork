-- =========================================================
-- TDS Management - Reset Default Admin Auth Account
-- =========================================================
-- Run this FIRST in Supabase SQL Editor if admin login says:
-- "Invalid login credentials".
--
-- This removes ONLY admin@tds.com from Supabase Auth and public.user_roles.
-- It does not delete student accounts or app data.
-- =========================================================

begin;

do $$
declare
  admin_email text := 'admin@tds.com';
  admin_id uuid;
begin
  select id into admin_id
  from auth.users
  where lower(email) = lower(admin_email)
  limit 1;

  if admin_id is not null then
    delete from public.user_roles
    where user_id = admin_id
       or lower(email) = lower(admin_email);

    delete from auth.identities
    where user_id = admin_id
       or lower(identity_data->>'email') = lower(admin_email);

    delete from auth.users
    where id = admin_id
       or lower(email) = lower(admin_email);
  else
    delete from public.user_roles
    where lower(email) = lower(admin_email);

    delete from auth.identities
    where lower(identity_data->>'email') = lower(admin_email);
  end if;
end $$;

commit;

select 'admin@tds.com auth account reset. Now run 01-enable-admin-auth.sql.' as result;
