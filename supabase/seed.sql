-- =========================================================
-- TDS Management local development seed data
-- Safe to re-run: all inserts use ON CONFLICT DO NOTHING.
-- =========================================================

alter type issue_category add value if not exists 'Academic';
alter type issue_category add value if not exists 'Technical';
alter type issue_category add value if not exists 'Personal';

insert into public.courses (id, code, title)
values
  ('10000000-0000-0000-0000-000000000101', 'CS101', 'Introduction to Computer Science'),
  ('10000000-0000-0000-0000-000000000201', 'MATH201', 'Applied Calculus'),
  ('10000000-0000-0000-0000-000000000301', 'ENG301', 'Academic Writing and Research'),
  ('10000000-0000-0000-0000-000000000401', 'PHY101', 'General Physics')
on conflict do nothing;

insert into public.students (
  id,
  name,
  email,
  assigned_trainer,
  notes,
  overall_status,
  priority,
  progress,
  last_update
)
values
  ('20000000-0000-0000-0000-000000000001', 'Ava Thompson', 'ava.thompson@example.edu', 'Nora Patel', 'Strong programming fundamentals; needs help with lab pacing.', 'Pending', 'High', 62, now() - interval '2 days'),
  ('20000000-0000-0000-0000-000000000002', 'Liam Carter', 'liam.carter@example.edu', 'Marcus Lee', 'Consistent attendance and improving assignment quality.', 'Resolved', 'Low', 88, now() - interval '8 days'),
  ('20000000-0000-0000-0000-000000000003', 'Maya Singh', 'maya.singh@example.edu', 'Nora Patel', 'Requires close follow-up on thesis planning.', 'Escalated', 'Critical', 41, now() - interval '1 day'),
  ('20000000-0000-0000-0000-000000000004', 'Noah Williams', 'noah.williams@example.edu', 'Elena Garcia', 'Technical setup is improving after repeated support sessions.', 'In Progress', 'Medium', 55, now() - interval '4 days'),
  ('20000000-0000-0000-0000-000000000005', 'Sophia Chen', 'sophia.chen@example.edu', 'Marcus Lee', 'Excellent writing voice; occasionally misses citation details.', 'Pending', 'Medium', 73, now() - interval '3 days'),
  ('20000000-0000-0000-0000-000000000006', 'Ethan Brooks', 'ethan.brooks@example.edu', 'Elena Garcia', 'Needs extra practice with physics problem sets.', 'In Progress', 'High', 47, now() - interval '5 days')
on conflict do nothing;

insert into public.student_courses (id, student_id, course_id)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000101'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000201'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000301'),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000301'),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000201'),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000101'),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000401'),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000301'),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000101'),
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000401')
on conflict do nothing;

insert into public.issues (
  id,
  student_id,
  category,
  description,
  status,
  priority,
  created_at
)
values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Academic', 'Needs additional practice on recursion exercises before the next lab assessment.', 'In Progress', 'High', now() - interval '9 days'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Technical', 'Development environment has intermittent package installation failures.', 'Pending', 'Medium', now() - interval '6 days'),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'Academic', 'Research outline was revised and approved after feedback.', 'Resolved', 'Low', now() - interval '12 days'),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'Personal', 'Student requested a temporary deadline extension due to scheduling constraints.', 'Resolved', 'Medium', now() - interval '10 days'),
  ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', 'Academic', 'Thesis topic is still too broad and requires urgent narrowing.', 'Escalated', 'Critical', now() - interval '3 days'),
  ('40000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', 'Personal', 'Student reported stress and needs a check-in before the next milestone.', 'Pending', 'High', now() - interval '2 days'),
  ('40000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000004', 'Technical', 'Physics simulation tool is not loading on the student laptop.', 'In Progress', 'Medium', now() - interval '7 days'),
  ('40000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000004', 'Academic', 'Missed two lab reflections and needs a recovery plan.', 'Pending', 'High', now() - interval '4 days'),
  ('40000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000005', 'Academic', 'Citation format problems in the draft submission.', 'Pending', 'Medium', now() - interval '5 days'),
  ('40000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000005', 'Technical', 'Submission portal upload failed and was later retried successfully.', 'Resolved', 'Low', now() - interval '11 days'),
  ('40000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000006', 'Academic', 'Difficulty applying Newtonian mechanics formulas to multi-step problems.', 'In Progress', 'High', now() - interval '6 days'),
  ('40000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000006', 'Personal', 'Attendance dipped during the last week and requires follow-up.', 'In Progress', 'Medium', now() - interval '1 day')
on conflict do nothing;

insert into public.comments (
  id,
  student_id,
  issue_id,
  author_name,
  role,
  text,
  created_at
)
values
  ('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Admin User', 'Admin', 'Shared a recursion practice set and scheduled a short review call.', now() - interval '8 days'),
  ('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'Student Simulator', 'Student', 'I still cannot install the required package on my laptop.', now() - interval '5 days'),
  ('50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', 'Admin User', 'Admin', 'The revised outline meets the assignment expectations.', now() - interval '9 days'),
  ('50000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000006', 'Student Simulator', 'Student', 'I am not sure which thesis direction is best and need help deciding.', now() - interval '2 days'),
  ('50000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000007', 'Admin User', 'Admin', 'Asked the student to try the browser-based simulator as a temporary workaround.', now() - interval '6 days'),
  ('50000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000009', 'Student Simulator', 'Student', 'I updated the bibliography but need confirmation that the format is correct.', now() - interval '4 days'),
  ('50000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000011', 'Admin User', 'Admin', 'Prepared a step-by-step worksheet for the next tutoring session.', now() - interval '5 days'),
  ('50000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000008', 'Student Simulator', 'Student', 'I missed class because of travel and want to catch up this week.', now() - interval '1 day')
on conflict do nothing;

insert into public.prompts (
  id,
  title,
  category,
  content,
  related_course_id,
  tags
)
values
  ('60000000-0000-0000-0000-000000000001', 'Programming Concept Explainer', 'Assignment', 'Explain the target programming concept in plain language, then provide one annotated example and two practice questions.', '10000000-0000-0000-0000-000000000101', array['programming', 'practice', 'feedback']),
  ('60000000-0000-0000-0000-000000000002', 'Calculus Problem Walkthrough', 'Research', 'Break down this calculus problem into assumptions, formulas, substitution steps, and a final verification check.', '10000000-0000-0000-0000-000000000201', array['calculus', 'steps', 'verification']),
  ('60000000-0000-0000-0000-000000000003', 'Academic Essay Feedback', 'Feedback', 'Review the essay for thesis clarity, paragraph structure, citation quality, and action-oriented revision notes.', '10000000-0000-0000-0000-000000000301', array['writing', 'feedback', 'citations'])
on conflict do nothing;

insert into public.ai_tools (
  id,
  tool_name,
  description,
  usage_count,
  active_students,
  related_problems,
  success_rate
)
values
  ('70000000-0000-0000-0000-000000000001', 'ChatGPT', 'General academic support, writing feedback, and programming explanations.', 1840, 126, 34, 87),
  ('70000000-0000-0000-0000-000000000002', 'Claude', 'Long-form drafting support, document review, and research synthesis.', 920, 74, 16, 91)
on conflict do nothing;
