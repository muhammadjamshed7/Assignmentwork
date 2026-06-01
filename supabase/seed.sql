-- =========================================================
-- TDS Management local development seed data
-- =========================================================
--
-- Only approved baseline tool records are seeded here.
-- Writers, courses, issues, comments, and prompts are intentionally
-- left empty so real operational data can be added later.

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
  (
    '70000000-0000-0000-0000-000000000001',
    'ChatGPT',
    $description$
Official link: https://chatgpt.com

Benefits:
- Strong general-purpose assistant for planning, drafting, analysis, coding, and explanations.
- Useful for turning rough requirements into structured tasks, checklists, and polished outputs.
- Good first-pass tool for brainstorming, rewriting, summarizing, and step-by-step problem solving.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000002',
    'Claude Opus',
    $description$
Official link: https://claude.ai

Benefits:
- Strong for careful long-form writing, deep reasoning, document review, and complex coding support.
- Useful when quality, nuance, and structured analysis matter more than quick short answers.
- Claude's free plan is available for general Claude use; Opus access may depend on the current Claude plan and availability.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000003',
    'Google Gemini',
    $description$
Official link: https://gemini.google.com

Benefits:
- Useful for everyday research, writing, summaries, brainstorming, and productivity workflows.
- Strong fit when Google ecosystem context is useful, such as Search, YouTube, Maps, Gmail, Docs, or Drive workflows.
- Supports multimodal assistance depending on account, plan, region, and current Gemini app availability.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000004',
    'Grok',
    $description$
Official link: https://grok.com

Benefits:
- Useful for fast conversational answers, reasoning, coding help, and current-context exploration.
- Helpful for X/social-context research workflows when used through supported Grok/X surfaces.
- Developer workflows can use xAI API access where available.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000005',
    'Perplexity',
    $description$
Official link: https://www.perplexity.ai

Benefits:
- Strong for web research, source discovery, and citation-backed answers.
- Useful for quickly checking current information before writing or making decisions.
- Good fit for comparing sources, finding references, and moving from question to verified direction.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000006',
    'Google AI Studio',
    $description$
Official link: https://aistudio.google.com/apps

Benefits for end-to-end work:
- Build AI-powered apps quickly from prompts using Gemini.
- Prototype multimodal workflows across text, image, video, audio, and tool/search use cases.
- Use starter apps, the app gallery, and a built-in code editor to remix, save, share, and integrate code.
- Get Gemini API keys for moving from prototype toward real app integration.
- Use logs and datasets to debug model calls, evaluate quality, refine prompts, and track behavior from prototype to production.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000007',
    'LMArena',
    $description$
Official link: https://lmarena.ai

Benefits:
- Useful free/quick arena for comparing different frontier LLM outputs side by side where models are available.
- Helps decide which model is better for a prompt before committing time or paid usage elsewhere.
- Includes leaderboard and battle-style comparison workflows.
- Privacy note: do not submit sensitive, private, or client data because arena conversations may be processed by third-party AI providers.
$description$,
    0,
    0,
    0,
    100
  )
on conflict (tool_name) do update
set
  description = excluded.description,
  updated_at = now();
