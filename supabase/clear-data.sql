-- =========================================================
-- Clears ALL app data while preserving schema.
-- Run this, then run seed.sql to repopulate fresh.
-- =========================================================
begin;

-- Disable triggers temporarily for clean truncation
set session_replication_role = replica;

-- Truncate in FK order: child tables first
truncate table public.student_courses cascade;
truncate table public.comments cascade;
truncate table public.issues cascade;
truncate table public.prompts cascade;
truncate table public.ai_tools cascade;
truncate table public.students cascade;
truncate table public.courses cascade;

-- Re-enable triggers
set session_replication_role = default;

-- Reset sequences (not needed for UUIDs, but for good measure)
commit;
