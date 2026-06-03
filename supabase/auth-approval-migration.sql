-- TDS auth/approval migration.
-- Run this once in Supabase SQL Editor or with:
-- psql "$DATABASE_URL" < supabase/auth-approval-migration.sql

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
update public.user_roles set email = auth_users.email
from auth.users auth_users
where public.user_roles.user_id = auth_users.id and public.user_roles.email is null;
delete from public.user_roles where email is null;
alter table public.user_roles alter column email set not null;

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

drop policy if exists "Allow public app access" on public.courses;
drop policy if exists "Allow public app access" on public.students;
drop policy if exists "Allow public app access" on public.student_courses;
drop policy if exists "Allow public app access" on public.issues;
drop policy if exists "Allow public app access" on public.comments;
drop policy if exists "Allow public app access" on public.prompts;
drop policy if exists "Allow public app access" on public.ai_tools;
drop policy if exists "Allow public role access" on public.user_roles;

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

drop policy if exists "Approved admin all" on public.courses;
drop policy if exists "Approved admin all" on public.students;
drop policy if exists "Approved admin all" on public.student_courses;
drop policy if exists "Approved admin all" on public.issues;
drop policy if exists "Approved admin all" on public.comments;
drop policy if exists "Approved admin all" on public.prompts;
drop policy if exists "Approved admin all" on public.ai_tools;

create policy "Approved admin all" on public.courses for all to authenticated using (public.is_approved_admin()) with check (public.is_approved_admin());
create policy "Approved admin all" on public.students for all to authenticated using (public.is_approved_admin()) with check (public.is_approved_admin());
create policy "Approved admin all" on public.student_courses for all to authenticated using (public.is_approved_admin()) with check (public.is_approved_admin());
create policy "Approved admin all" on public.issues for all to authenticated using (public.is_approved_admin()) with check (public.is_approved_admin());
create policy "Approved admin all" on public.comments for all to authenticated using (public.is_approved_admin()) with check (public.is_approved_admin());
create policy "Approved admin all" on public.prompts for all to authenticated using (public.is_approved_admin()) with check (public.is_approved_admin());
create policy "Approved admin all" on public.ai_tools for all to authenticated using (public.is_approved_admin()) with check (public.is_approved_admin());

drop policy if exists "Approved student read assigned courses" on public.courses;
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

drop policy if exists "Approved student read own student" on public.students;
create policy "Approved student read own student"
on public.students for select to authenticated
using (public.is_approved_student() and id = public.current_student_id());

drop policy if exists "Approved student read own enrollments" on public.student_courses;
create policy "Approved student read own enrollments"
on public.student_courses for select to authenticated
using (public.is_approved_student() and student_id = public.current_student_id());

drop policy if exists "Approved student read own issues" on public.issues;
create policy "Approved student read own issues"
on public.issues for select to authenticated
using (public.is_approved_student() and student_id = public.current_student_id());

drop policy if exists "Approved student create own issues" on public.issues;
create policy "Approved student create own issues"
on public.issues for insert to authenticated
with check (public.is_approved_student() and student_id = public.current_student_id());

drop policy if exists "Approved student read own comments" on public.comments;
create policy "Approved student read own comments"
on public.comments for select to authenticated
using (public.is_approved_student() and student_id = public.current_student_id());

drop policy if exists "Approved student create own comments" on public.comments;
create policy "Approved student create own comments"
on public.comments for insert to authenticated
with check (public.is_approved_student() and student_id = public.current_student_id());

drop policy if exists "Approved students read prompts" on public.prompts;
create policy "Approved students read prompts"
on public.prompts for select to authenticated
using (public.is_approved_student());

drop policy if exists "Approved students read ai tools" on public.ai_tools;
create policy "Approved students read ai tools"
on public.ai_tools for select to authenticated
using (public.is_approved_student());
