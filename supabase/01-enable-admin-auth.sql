-- =========================================================
-- TDS Management - Enable Auth + Create Default Admin
-- =========================================================
-- Run this SECOND in Supabase SQL Editor, after:
--   supabase/00-reset-admin-auth.sql
--
-- Default admin login:
--   Email:    admin@tds.com
--   Password: khan123office
--
-- Admin role:
--   role = admin
--   status = approved
--
-- Student behavior:
--   role = student
--   status = pending until admin approval
--   approved students can only read/use their own student data.
-- =========================================================

begin;

create extension if not exists "pgcrypto";

-- 1. Approval-aware schema repair.
alter table public.students add column if not exists user_id uuid unique references auth.users(id) on delete set null;

alter table public.user_roles add column if not exists email text;
alter table public.user_roles add column if not exists status text not null default 'pending';
alter table public.user_roles add column if not exists student_id uuid unique references public.students(id) on delete set null;
alter table public.user_roles add column if not exists approved_by uuid references auth.users(id) on delete set null;
alter table public.user_roles add column if not exists approved_at timestamptz;

alter table public.user_roles drop constraint if exists user_roles_role_check;
alter table public.user_roles add constraint user_roles_role_check check (role in ('admin', 'student'));
alter table public.user_roles drop constraint if exists user_roles_status_check;
alter table public.user_roles add constraint user_roles_status_check check (status in ('pending', 'approved', 'rejected', 'disabled'));

update public.user_roles set role = 'student' where role = 'viewer';
update public.user_roles
set email = auth_users.email
from auth.users auth_users
where public.user_roles.user_id = auth_users.id
and public.user_roles.email is null;

delete from public.user_roles where email is null;
alter table public.user_roles alter column email set not null;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_roles where user_id = auth.uid() limit 1
$$;

create or replace function public.current_user_status()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select status from public.user_roles where user_id = auth.uid() limit 1
$$;

create or replace function public.current_student_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select student_id from public.user_roles where user_id = auth.uid() limit 1
$$;

create or replace function public.is_approved_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin' and public.current_user_status() = 'approved', false)
$$;

create or replace function public.is_approved_student()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'student' and public.current_user_status() = 'approved', false)
$$;

create index if not exists idx_students_user_id on public.students(user_id);
create index if not exists idx_user_roles_role_status on public.user_roles(role, status);

-- 2. RLS policies.
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;

alter table public.courses enable row level security;
alter table public.students enable row level security;
alter table public.student_courses enable row level security;
alter table public.issues enable row level security;
alter table public.comments enable row level security;
alter table public.prompts enable row level security;
alter table public.ai_tools enable row level security;
alter table public.user_roles enable row level security;

drop policy if exists "Allow public app access" on public.courses;
drop policy if exists "Allow public app access" on public.students;
drop policy if exists "Allow public app access" on public.student_courses;
drop policy if exists "Allow public app access" on public.issues;
drop policy if exists "Allow public app access" on public.comments;
drop policy if exists "Allow public app access" on public.prompts;
drop policy if exists "Allow public app access" on public.ai_tools;
drop policy if exists "Allow public role access" on public.user_roles;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['courses', 'students', 'student_courses', 'issues', 'comments', 'prompts', 'ai_tools']
  loop
    execute format('drop policy if exists "Authenticated read" on public.%I', table_name);
    execute format('drop policy if exists "Admin insert" on public.%I', table_name);
    execute format('drop policy if exists "Admin update" on public.%I', table_name);
    execute format('drop policy if exists "Admin delete" on public.%I', table_name);
    execute format('drop policy if exists "Approved admin all" on public.%I', table_name);
    execute format('drop policy if exists "Approved student read assigned courses" on public.%I', table_name);
    execute format('drop policy if exists "Approved student read own student" on public.%I', table_name);
    execute format('drop policy if exists "Approved student read own enrollments" on public.%I', table_name);
    execute format('drop policy if exists "Approved student read own issues" on public.%I', table_name);
    execute format('drop policy if exists "Approved student create own issues" on public.%I', table_name);
    execute format('drop policy if exists "Approved student read own comments" on public.%I', table_name);
    execute format('drop policy if exists "Approved student create own comments" on public.%I', table_name);
    execute format('drop policy if exists "Approved students read prompts" on public.%I', table_name);
    execute format('drop policy if exists "Approved students read ai tools" on public.%I', table_name);
  end loop;
end $$;

drop policy if exists "Authenticated read own role or admin" on public.user_roles;
drop policy if exists "Admin insert roles" on public.user_roles;
drop policy if exists "Admin update roles" on public.user_roles;
drop policy if exists "Admin delete roles" on public.user_roles;
drop policy if exists "Users read own role or admin" on public.user_roles;
drop policy if exists "Admin manage roles" on public.user_roles;

create policy "Users read own role or admin"
on public.user_roles
for select
to authenticated
using (user_id = auth.uid() or public.is_approved_admin());

create policy "Admin manage roles"
on public.user_roles
for all
to authenticated
using (public.is_approved_admin())
with check (public.is_approved_admin());

create policy "Approved admin all" on public.courses for all to authenticated using (public.is_approved_admin()) with check (public.is_approved_admin());
create policy "Approved admin all" on public.students for all to authenticated using (public.is_approved_admin()) with check (public.is_approved_admin());
create policy "Approved admin all" on public.student_courses for all to authenticated using (public.is_approved_admin()) with check (public.is_approved_admin());
create policy "Approved admin all" on public.issues for all to authenticated using (public.is_approved_admin()) with check (public.is_approved_admin());
create policy "Approved admin all" on public.comments for all to authenticated using (public.is_approved_admin()) with check (public.is_approved_admin());
create policy "Approved admin all" on public.prompts for all to authenticated using (public.is_approved_admin()) with check (public.is_approved_admin());
create policy "Approved admin all" on public.ai_tools for all to authenticated using (public.is_approved_admin()) with check (public.is_approved_admin());

create policy "Approved student read assigned courses"
on public.courses for select to authenticated
using (
  public.is_approved_student()
  and exists (
    select 1 from public.student_courses sc
    where sc.course_id = courses.id
    and sc.student_id = public.current_student_id()
  )
);

create policy "Approved student read own student"
on public.students for select to authenticated
using (public.is_approved_student() and id = public.current_student_id());

create policy "Approved student read own enrollments"
on public.student_courses for select to authenticated
using (public.is_approved_student() and student_id = public.current_student_id());

create policy "Approved student read own issues"
on public.issues for select to authenticated
using (public.is_approved_student() and student_id = public.current_student_id());

create policy "Approved student create own issues"
on public.issues for insert to authenticated
with check (public.is_approved_student() and student_id = public.current_student_id());

create policy "Approved student read own comments"
on public.comments for select to authenticated
using (public.is_approved_student() and student_id = public.current_student_id());

create policy "Approved student create own comments"
on public.comments for insert to authenticated
with check (public.is_approved_student() and student_id = public.current_student_id());

create policy "Approved students read prompts"
on public.prompts for select to authenticated
using (public.is_approved_student());

create policy "Approved students read ai tools"
on public.ai_tools for select to authenticated
using (public.is_approved_student());

-- 3. Create the default admin user from a clean state.
do $$
declare
  admin_email text := 'admin@tds.com';
  admin_password text := 'khan123office';
  admin_id uuid := gen_random_uuid();
begin
  if exists (select 1 from auth.users where lower(email) = lower(admin_email)) then
    raise exception 'admin@tds.com already exists. Run 00-reset-admin-auth.sql first, then run this file again.';
  end if;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_change,
    phone_change_token,
    email_change_token_current,
    email_change_confirm_status,
    reauthentication_token,
    is_sso_user,
    deleted_at
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    admin_id,
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"admin","status":"approved"}'::jsonb,
    false,
    now(),
    now(),
    null,
    '',
    '',
    '',
    0,
    '',
    false,
    null
  );

  insert into auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    admin_id::text,
    admin_id,
    jsonb_build_object(
      'sub', admin_id::text,
      'email', admin_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  );

  insert into public.user_roles (
    user_id,
    email,
    role,
    status,
    approved_by,
    approved_at
  )
  values (
    admin_id,
    admin_email,
    'admin',
    'approved',
    admin_id,
    now()
  );
end $$;

commit;

select 'Admin enabled. Login with admin@tds.com / khan123office' as result;
