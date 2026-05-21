-- =========================================================
-- EduMetrics current app schema
-- Tables covered by the current UI only:
-- students, courses, student_courses, issues, comments,
-- prompts, ai_tools
-- =========================================================

-- 1. Extensions
create extension if not exists "pgcrypto";

-- 2. Enums
do $$ begin
  create type user_role as enum ('Student', 'Admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type issue_status as enum ('Pending', 'In Progress', 'Resolved', 'Escalated');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type priority_level as enum ('Low', 'Medium', 'High', 'Critical');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type issue_category as enum (
    'Prompt Issues',
    'Stealth Writer Issues',
    'Instructions Issues',
    'Data Extraction Issues',
    'Reference Memory Issues',
    'Thesis Issues',
    'Remake Required',
    'Other'
  );
exception
  when duplicate_object then null;
end $$;

alter type issue_category add value if not exists 'Other';

-- 3. Updated timestamp helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 4. Core tables
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  assigned_trainer text not null default 'Unassigned',
  notes text,
  overall_status issue_status not null default 'Pending',
  priority priority_level not null default 'Medium',
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  last_update timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_courses (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  category issue_category not null,
  description text not null,
  status issue_status not null default 'Pending',
  priority priority_level not null default 'Medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  issue_id uuid references public.issues(id) on delete cascade,
  author_name text not null,
  role user_role not null,
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'General',
  content text not null,
  related_course_id uuid references public.courses(id) on delete set null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_tools (
  id uuid primary key default gen_random_uuid(),
  tool_name text not null unique,
  usage_count integer not null default 0 check (usage_count >= 0),
  active_students integer not null default 0 check (active_students >= 0),
  related_problems integer not null default 0 check (related_problems >= 0),
  success_rate integer not null default 100 check (success_rate >= 0 and success_rate <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Student rollup helper
create or replace function public.sync_student_issue_summary(target_student_id uuid)
returns void
language plpgsql
as $$
declare
  next_status issue_status;
  next_priority priority_level;
begin
  select
    case
      when count(*) filter (where status = 'Escalated') > 0 then 'Escalated'::issue_status
      when count(*) filter (where status = 'Pending') > 0 then 'Pending'::issue_status
      when count(*) filter (where status = 'In Progress') > 0 then 'In Progress'::issue_status
      else 'Resolved'::issue_status
    end,
    case
      when count(*) filter (where priority = 'Critical') > 0 then 'Critical'::priority_level
      when count(*) filter (where priority = 'High') > 0 then 'High'::priority_level
      when count(*) filter (where priority = 'Medium') > 0 then 'Medium'::priority_level
      else 'Low'::priority_level
    end
  into next_status, next_priority
  from public.issues
  where student_id = target_student_id;

  update public.students
  set
    overall_status = coalesce(next_status, 'Resolved'::issue_status),
    priority = coalesce(next_priority, 'Low'::priority_level),
    last_update = now(),
    updated_at = now()
  where id = target_student_id;
end;
$$;

create or replace function public.sync_student_after_issue_change()
returns trigger
language plpgsql
as $$
begin
  perform public.sync_student_issue_summary(coalesce(new.student_id, old.student_id));
  return coalesce(new, old);
end;
$$;

create or replace function public.mark_issue_pending_after_student_comment()
returns trigger
language plpgsql
as $$
begin
  if new.role = 'Student' and new.issue_id is not null then
    update public.issues
    set status = 'Pending', updated_at = now()
    where id = new.issue_id;
  end if;

  update public.students
  set last_update = now(), updated_at = now()
  where id = new.student_id;

  return new;
end;
$$;

-- 6. Triggers
drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at
before update on public.students
for each row execute function public.set_updated_at();

drop trigger if exists issues_set_updated_at on public.issues;
create trigger issues_set_updated_at
before update on public.issues
for each row execute function public.set_updated_at();

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

drop trigger if exists prompts_set_updated_at on public.prompts;
create trigger prompts_set_updated_at
before update on public.prompts
for each row execute function public.set_updated_at();

drop trigger if exists ai_tools_set_updated_at on public.ai_tools;
create trigger ai_tools_set_updated_at
before update on public.ai_tools
for each row execute function public.set_updated_at();

drop trigger if exists issues_sync_student_insert on public.issues;
create trigger issues_sync_student_insert
after insert on public.issues
for each row execute function public.sync_student_after_issue_change();

drop trigger if exists issues_sync_student_update on public.issues;
create trigger issues_sync_student_update
after update of status, priority, category on public.issues
for each row execute function public.sync_student_after_issue_change();

drop trigger if exists issues_sync_student_delete on public.issues;
create trigger issues_sync_student_delete
after delete on public.issues
for each row execute function public.sync_student_after_issue_change();

drop trigger if exists comments_student_pending on public.comments;
create trigger comments_student_pending
after insert on public.comments
for each row execute function public.mark_issue_pending_after_student_comment();

-- 7. Indexes
create index if not exists idx_student_courses_student_id on public.student_courses(student_id);
create index if not exists idx_student_courses_course_id on public.student_courses(course_id);
create index if not exists idx_issues_student_id on public.issues(student_id);
create index if not exists idx_issues_status on public.issues(status);
create index if not exists idx_comments_student_id on public.comments(student_id);
create index if not exists idx_comments_issue_id on public.comments(issue_id);
create index if not exists idx_prompts_category on public.prompts(category);
create index if not exists idx_prompts_related_course_id on public.prompts(related_course_id);

-- 8. Row level security
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

drop policy if exists "Allow public app access" on public.courses;
create policy "Allow public app access" on public.courses for all using (true) with check (true);

drop policy if exists "Allow public app access" on public.students;
create policy "Allow public app access" on public.students for all using (true) with check (true);

drop policy if exists "Allow public app access" on public.student_courses;
create policy "Allow public app access" on public.student_courses for all using (true) with check (true);

drop policy if exists "Allow public app access" on public.issues;
create policy "Allow public app access" on public.issues for all using (true) with check (true);

drop policy if exists "Allow public app access" on public.comments;
create policy "Allow public app access" on public.comments for all using (true) with check (true);

drop policy if exists "Allow public app access" on public.prompts;
create policy "Allow public app access" on public.prompts for all using (true) with check (true);

drop policy if exists "Allow public app access" on public.ai_tools;
create policy "Allow public app access" on public.ai_tools for all using (true) with check (true);

-- 9. Realtime
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime set table
  public.courses,
  public.students,
  public.student_courses,
  public.issues,
  public.comments,
  public.prompts,
  public.ai_tools;

-- 10. Seed data for the current app
insert into public.courses (id, code, title) values
  ('00000000-0000-0000-0000-000000000c01', 'CS101', 'Introduction to Computer Science'),
  ('00000000-0000-0000-0000-000000000c02', 'ENG201', 'Advanced Literature and Thesis Writing'),
  ('00000000-0000-0000-0000-000000000c03', 'PHY101', 'Physics Fundamentals'),
  ('00000000-0000-0000-0000-000000000c04', 'MTH101', 'Calculus I'),
  ('00000000-0000-0000-0000-000000000c05', 'CS201', 'Data Structures via AI'),
  ('00000000-0000-0000-0000-000000000c06', 'ENG101', 'Academic Writing Basics'),
  ('00000000-0000-0000-0000-000000000c07', 'BIO101', 'Biology Fundamentals'),
  ('00000000-0000-0000-0000-000000000c08', 'CHM101', 'Chemistry Fundamentals'),
  ('00000000-0000-0000-0000-000000000c09', 'HIS101', 'History Foundations')
on conflict (code) do update set title = excluded.title;

insert into public.ai_tools (id, tool_name, usage_count, active_students, related_problems, success_rate) values
  ('00000000-0000-0000-0000-000000000a01', 'ChatGPT', 450, 120, 15, 85),
  ('00000000-0000-0000-0000-000000000a02', 'Claude', 320, 85, 8, 92),
  ('00000000-0000-0000-0000-000000000a03', 'Stealth Writer', 200, 60, 45, 40),
  ('00000000-0000-0000-0000-000000000a04', 'WriteHuman', 150, 40, 25, 55),
  ('00000000-0000-0000-0000-000000000a05', 'Gemini', 280, 90, 12, 88),
  ('00000000-0000-0000-0000-000000000a06', 'QuillBot', 500, 150, 10, 95),
  ('00000000-0000-0000-0000-000000000a07', 'Grammarly', 800, 200, 5, 98)
on conflict (tool_name) do update set
  usage_count = excluded.usage_count,
  active_students = excluded.active_students,
  related_problems = excluded.related_problems,
  success_rate = excluded.success_rate;

insert into public.students (id, name, email, assigned_trainer, overall_status, priority, progress, last_update) values
  ('00000000-0000-0000-0000-000000000001', 'Tayab Abbas', null, 'Sarah Jenkins', 'In Progress', 'High', 45, now() - interval '2 hours'),
  ('00000000-0000-0000-0000-000000000002', 'Shehzad Ali', null, 'Mark Ruffalo', 'Pending', 'Medium', 20, now() - interval '5 hours'),
  ('00000000-0000-0000-0000-000000000003', 'Atiq', null, 'Sarah Jenkins', 'Resolved', 'Low', 95, now() - interval '24 hours'),
  ('00000000-0000-0000-0000-000000000004', 'Ahmad Shehzad', null, 'John Doe', 'Pending', 'Medium', 30, now() - interval '48 hours'),
  ('00000000-0000-0000-0000-000000000005', 'Sakhi Abbas', null, 'Sarah Jenkins', 'In Progress', 'Low', 60, now() - interval '12 hours'),
  ('00000000-0000-0000-0000-000000000006', 'Fayaz', null, 'John Doe', 'Escalated', 'Critical', 10, now() - interval '1 hour'),
  ('00000000-0000-0000-0000-000000000007', 'Makhdom Raza', null, 'Mark Ruffalo', 'Escalated', 'Critical', 5, now() - interval '30 minutes')
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  assigned_trainer = excluded.assigned_trainer,
  overall_status = excluded.overall_status,
  priority = excluded.priority,
  progress = excluded.progress,
  last_update = excluded.last_update;

insert into public.student_courses (student_id, course_id) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000c01'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000c02'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000c03'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000c04'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000c01'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000c05'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000c06'),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000c07'),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000c08'),
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000c09')
on conflict (student_id, course_id) do nothing;

insert into public.issues (id, student_id, category, description, status, priority, created_at) values
  ('00000000-0000-0000-0000-00000000e101', '00000000-0000-0000-0000-000000000001', 'Prompt Issues', 'Student is struggling with Prompt Issues. Needs guidance.', 'In Progress', 'High', now() - interval '10 hours'),
  ('00000000-0000-0000-0000-00000000e102', '00000000-0000-0000-0000-000000000001', 'Stealth Writer Issues', 'Student is struggling with Stealth Writer Issues. Needs guidance.', 'In Progress', 'High', now() - interval '12 hours'),
  ('00000000-0000-0000-0000-00000000e201', '00000000-0000-0000-0000-000000000002', 'Instructions Issues', 'Student is struggling with Instructions Issues. Needs guidance.', 'Pending', 'Medium', now() - interval '10 hours'),
  ('00000000-0000-0000-0000-00000000e202', '00000000-0000-0000-0000-000000000002', 'Stealth Writer Issues', 'Student is struggling with Stealth Writer Issues. Needs guidance.', 'Pending', 'Medium', now() - interval '12 hours'),
  ('00000000-0000-0000-0000-00000000e301', '00000000-0000-0000-0000-000000000003', 'Instructions Issues', 'Student is struggling with Instructions Issues. Needs guidance.', 'Resolved', 'Low', now() - interval '10 hours'),
  ('00000000-0000-0000-0000-00000000e401', '00000000-0000-0000-0000-000000000004', 'Instructions Issues', 'Student is struggling with Instructions Issues. Needs guidance.', 'Pending', 'Medium', now() - interval '10 hours'),
  ('00000000-0000-0000-0000-00000000e402', '00000000-0000-0000-0000-000000000004', 'Stealth Writer Issues', 'Student is struggling with Stealth Writer Issues. Needs guidance.', 'Pending', 'Medium', now() - interval '12 hours'),
  ('00000000-0000-0000-0000-00000000e501', '00000000-0000-0000-0000-000000000005', 'Prompt Issues', 'Student is struggling with Prompt Issues. Needs guidance.', 'In Progress', 'Low', now() - interval '10 hours'),
  ('00000000-0000-0000-0000-00000000e601', '00000000-0000-0000-0000-000000000006', 'Prompt Issues', 'Student is struggling with Prompt Issues. Needs guidance.', 'Escalated', 'Critical', now() - interval '10 hours'),
  ('00000000-0000-0000-0000-00000000e602', '00000000-0000-0000-0000-000000000006', 'Stealth Writer Issues', 'Student is struggling with Stealth Writer Issues. Needs guidance.', 'Escalated', 'Critical', now() - interval '12 hours'),
  ('00000000-0000-0000-0000-00000000e603', '00000000-0000-0000-0000-000000000006', 'Data Extraction Issues', 'Student is struggling with Data Extraction Issues. Needs guidance.', 'Escalated', 'Critical', now() - interval '14 hours'),
  ('00000000-0000-0000-0000-00000000e701', '00000000-0000-0000-0000-000000000007', 'Reference Memory Issues', 'Student is struggling with Reference Memory Issues. Needs guidance.', 'Escalated', 'Critical', now() - interval '10 hours'),
  ('00000000-0000-0000-0000-00000000e702', '00000000-0000-0000-0000-000000000007', 'Thesis Issues', 'Student is struggling with Thesis Issues. Needs guidance.', 'Escalated', 'Critical', now() - interval '12 hours'),
  ('00000000-0000-0000-0000-00000000e703', '00000000-0000-0000-0000-000000000007', 'Remake Required', 'Student is struggling with Remake Required. Needs guidance.', 'Escalated', 'Critical', now() - interval '14 hours')
on conflict (id) do update set
  category = excluded.category,
  description = excluded.description,
  status = excluded.status,
  priority = excluded.priority;

insert into public.comments (id, student_id, issue_id, author_name, role, text, created_at) values
  ('00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000e102', 'Tayab Abbas', 'Student', 'I am not sure how to bypass the AI detectors with the new formatting.', now() - interval '5 hours'),
  ('00000000-0000-0000-0000-00000000d002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000e102', 'Sarah Jenkins', 'Admin', 'You should avoid relying purely on stealth writers. Focus on original drafting.', now() - interval '2 hours')
on conflict (id) do update set
  text = excluded.text,
  role = excluded.role,
  author_name = excluded.author_name;

insert into public.prompts (id, title, category, content, related_course_id, tags) values
  (
    '00000000-0000-0000-0000-000000000b01',
    'Assignment Clarification Checklist',
    'Instructions',
    'Review the assignment brief and identify the required deliverable, citation style, word count, deadline, source requirements, and any formatting constraints. List unclear points as direct questions for the student before drafting.',
    '00000000-0000-0000-0000-000000000c02',
    array['brief', 'requirements', 'questions']
  ),
  (
    '00000000-0000-0000-0000-000000000b02',
    'Thesis Repair Prompt',
    'Thesis',
    'Rewrite the thesis so it makes one specific, arguable claim. Keep it concise, name the topic clearly, and preview the main reasoning without listing every paragraph.',
    '00000000-0000-0000-0000-000000000c02',
    array['thesis', 'rewrite']
  ),
  (
    '00000000-0000-0000-0000-000000000b03',
    'Data Extraction QA',
    'Data Extraction',
    'Extract only facts explicitly present in the provided source. Return a two-column table with field name and extracted value. Mark missing or ambiguous fields as "Not found" and do not infer.',
    '00000000-0000-0000-0000-000000000c01',
    array['data', 'qa', 'source']
  )
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  content = excluded.content,
  related_course_id = excluded.related_course_id,
  tags = excluded.tags;
