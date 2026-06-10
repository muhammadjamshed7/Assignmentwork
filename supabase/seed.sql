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
  ),
  (
    '70000000-0000-0000-0000-000000000020',
    'Google NotebookLM',
    $description$
Official link: https://notebooklm.google

Category: AI Research Tool & Thinking Partner

Benefits:
- Helps turn uploaded sources into study notes, summaries, outlines, FAQs, and research-friendly explanations.
- Useful for working with lecture notes, PDFs, articles, reports, and source collections in one grounded notebook.
- Good fit for academic research, assignment planning, source understanding, and revision support.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000021',
    'Napkin AI',
    $description$
Official link: https://www.napkin.ai

Category: Visual AI for Business Storytelling

Benefits:
- Turns business ideas, notes, and written concepts into clear visuals for storytelling and presentations.
- Useful for diagrams, frameworks, process visuals, strategy explanations, and slide-ready communication.
- Good fit for business, MBA/BBA, marketing, strategy, and presentation planning tasks.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000022',
    'NoteGPT',
    $description$
Official link: https://notegpt.io

Category: All-in-One AI Learning Assistant

Benefits:
- Helps summarize lectures, videos, PDFs, and study materials into clearer notes and deep summaries.
- Useful for listening on the go, translating PDFs, creating visuals for notes, and getting instant AI help.
- Good fit for studying smarter, reviewing academic material, and turning learning content into reusable notes.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000008',
    'Custom GPT AI Humanizer',
    $description$
Alternative Name: Custom GPT AI Humanizer
Category: Writing Tools / AI Humanizing / Rewriting
Official Link: https://chatgpt.com/g/g-2azCVmXdy-ai-humanizer

Short Description:
A custom ChatGPT-based AI humanizer designed to rewrite AI-generated text into a more natural, readable, and human-like style.

Recommended Use:
Humanizing assignment drafts, improving sentence flow, rewriting robotic text, and making academic writing sound more natural.

Student Note / Academic Integrity Note:
Use for refinement only. The final work must still be checked, edited, understood, and ethically submitted by the student.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000018',
    'HumanizeAI Pro',
    $description$
Alternative Name: Humanize AI Pro
Category: Writing Tools / AI Humanizing / Rewriting
Official Link: https://www.humanizeai.pro/

Short Description:
HumanizeAI Pro is an AI humanizing tool used to rewrite AI-generated text into clearer, smoother, and more natural writing.

Recommended Use:
Humanizing AI-assisted assignment drafts, improving fluency, polishing essays, and refining academic writing tone.

Student Note / Academic Integrity Note:
Use this tool for readability and language refinement only. The student must verify accuracy, originality, and assignment compliance before submission.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000019',
    'SuperHumanizer AI',
    $description$
Alternative Name: Super Humanizer AI
Category: Writing Tools / AI Humanizing / Rewriting
Official Link: https://superhumanizer.ai/

Short Description:
SuperHumanizer AI helps rewrite AI-generated content into more natural, human-like writing with improved flow and readability.

Recommended Use:
Rewriting AI-generated paragraphs, improving natural tone, and refining assignment drafts before final editing.

Student Note / Academic Integrity Note:
Use for writing polish only. Do not use it as a replacement for understanding, editing, or producing academically responsible work.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000009',
    'WriteHuman AI',
    $description$
Alternative Name: Write Human
Category: Writing Tools / AI Humanizing / Rewriting
Official Link: https://writehuman.ai/

Short Description:
WriteHuman AI rewrites AI-generated text into smoother, more natural, conversational writing while preserving the original meaning.

Recommended Use:
Humanizing ChatGPT, Gemini, Grok, Claude, or other AI-generated text before final editing.

Student Note / Academic Integrity Note:
Best for improving tone and readability in essays, reports, and general academic writing. Students must review and take responsibility for the final content.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000010',
    'GPTHuman AI',
    $description$
Alternative Name: GPT Human AI
Category: Writing Tools / AI Humanizing / Rewriting
Official Link: https://gpthuman.ai/

Short Description:
GPTHuman AI is an AI humanizer that rewrites AI-generated text into more natural, human-like writing.

Recommended Use:
Essay rewriting, assignment text polishing, and improving readability of AI-assisted drafts.

Student Note / Academic Integrity Note:
Use only after the student has reviewed the meaning, accuracy, and academic quality of the content.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000011',
    'WalterWrites',
    $description$
Alternative Names: Walter AI, Walterai Humanizer
Category: Writing Tools / AI Humanizing / Rewriting
Official Link: https://walterwrites.ai/

Short Description:
WalterWrites helps humanize, detect, and rewrite AI-generated content while preserving the writer's voice.

Recommended Use:
Rewriting AI-assisted drafts, improving natural tone, checking AI-likelihood, and preserving writing style.

Student Note / Academic Integrity Note:
Useful when the goal is to keep the student's original voice while improving clarity and fluency. Do not use to misrepresent authorship.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000012',
    'StealthWriter',
    $description$
Alternative Name: Stealth Writer
Category: AI Remover / Stealth Tools
Official Link: https://stealthwriter.ai/

Short Description:
StealthWriter rewrites AI-generated content into more natural, polished, human-like writing.

Recommended Use:
Refining robotic AI text, improving assignment readability, and making writing sound more natural.

Student Note / Academic Integrity Note:
Use for language improvement and readability, not for dishonest submission.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000013',
    'StealthGPT',
    $description$
Alternative Name: Stealth GPT
Category: AI Remover / Stealth Tools
Official Link: https://www.stealthgpt.ai/

Short Description:
StealthGPT is an AI rewriting and humanizing platform for transforming AI-generated content into more natural writing.

Recommended Use:
Rewriting AI-generated drafts, improving sentence variation, and refining tone.

Student Note / Academic Integrity Note:
Final text must be reviewed for accuracy, originality, and compliance with assignment rules.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000014',
    'AuraWrite AI',
    $description$
Alternative Name: AuraWrite
Category: Writing Tools / AI Humanizing / Rewriting
Official Link: https://aurawriteai.com/

Short Description:
AuraWrite AI humanizes AI-generated text by improving fluency, tone, sentence structure, and natural readability.

Recommended Use:
Academic writing refinement, essay polishing, rewriting AI-generated drafts, and improving clarity.

Student Note / Academic Integrity Note:
Suitable for improving natural language quality after the assignment content is already understood and prepared.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000015',
    'DigitalMagicWand',
    $description$
Alternative Name: Digital Magic Wand
Category: Writing Tools / AI Humanizing / Rewriting
Official Link: https://digitalmagicwand.com/ai-humanizer

Short Description:
DigitalMagicWand provides an AI humanizer for rewriting machine-generated text into more natural writing.

Recommended Use:
Rewriting AI-generated paragraphs, improving natural flow, and refining assignment text.

Student Note / Academic Integrity Note:
Use for readability improvement only. Do not use as a substitute for learning or original academic work.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000016',
    'Undetectable AI',
    $description$
Alternative Name: Undetectable.ai
Category: AI Remover / Stealth Tools
Official Link: https://undetectable.ai/

Short Description:
Undetectable AI provides AI detection and humanizing tools that rewrite AI-generated text into more natural writing.

Recommended Use:
Checking and refining AI-assisted writing, improving tone, and making text more readable.

Student Note / Academic Integrity Note:
Use carefully and ethically. The final assignment must remain accurate, properly reviewed, and compliant with academic rules.
$description$,
    0,
    0,
    0,
    100
  ),
  (
    '70000000-0000-0000-0000-000000000017',
    'BypassGPT',
    $description$
Alternative Name: Bypass GPT
Category: AI Remover / Stealth Tools
Official Link: https://www.bypassgpt.ai/

Short Description:
BypassGPT rewrites AI-generated text into more natural, human-like writing.

Recommended Use:
Rewriting AI-generated drafts, improving conversational tone, and polishing assignment content.

Student Note / Academic Integrity Note:
Must be used only for refinement and readability improvement, not for academic misconduct.
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

insert into public.prompts (
  id,
  title,
  category,
  content,
  tags
)
values
  (
    '80000000-0000-0000-0000-000000000001',
    'General Assignment Prompt',
    'Academic Writing',
    $prompt$
General Assignment Workflow - Brief to Completion

I am going to share my assignment brief and marking criteria with you. Your job is to read everything carefully, build a proper outline based on the brief requirements, then write the assignment section by section - one section at a time. Do not write everything at once.

My assignment brief and marking criteria:
[PASTE YOUR FULL BRIEF AND MARKING CRITERIA HERE]

Follow this exact process:

STAGE 1 - ANALYSE THE BRIEF
Read the full brief and identify:
- Assignment type (essay, report, case study, dissertation chapter, reflection, etc.)
- Word count and how it should be distributed across sections
- Subject and academic level
- Referencing style required
- Key requirements from the marking criteria - what gets the most marks and why
- Any specific instructions, restrictions, or formatting rules

Present a brief summary of your understanding before moving to the outline. Ask me to confirm before continuing.

STAGE 2 - BUILD THE OUTLINE
Based on the brief and marking criteria, create a section-by-section outline:
- List every section with its heading
- Write one sentence describing what each section will argue or cover
- Show the approximate word count for each section
- Confirm which sections carry the most marks

Do not start writing yet. Show me the outline and wait for my approval.

STAGE 3 - WRITE SECTION BY SECTION
After I approve the outline, write one section at a time.
- Start with Section 1 only
- End each section by asking: Section complete. Ready to move to [next section name]?
- Wait for my confirmation before writing the next section
- Follow the approved outline - do not change structure without asking
- Match the academic tone and referencing style required
- Hit the word count for each section

STAGE 4 - REVIEW EACH SECTION
After writing each section:
- State the word count of that section
- Confirm it addresses the marking criteria for that section
- Flag anything that may need more detail or a source

RULES:
- Never write more than one section at a time without my confirmation
- Always follow the brief requirements exactly
- Use academic language throughout
- Include in-text citations in the required referencing style
- Do not add a reference list until I ask for it at the end
$prompt$,
    array[
      'general',
      'essay',
      'report',
      'case study',
      'brief analysis',
      'outline',
      'section by section',
      'academic writing',
      'marking criteria'
    ]
  ),
  (
    '80000000-0000-0000-0000-000000000002',
    'Specific Assignment Prompt',
    'Academic Writing',
    $prompt$
Specific Assignment Workflow - Type-Based Brief to Completion

I am going to share my assignment type, brief, and marking criteria. Your job is to first identify the assignment type, apply the correct structure for that type, build a detailed outline, then write it section by section - one section at a time. Do not write everything at once.

My assignment type is:
[WRITE TYPE HERE - e.g. Essay, Report, Case Study, Literature Review, Reflective Writing, Dissertation Chapter, Presentation Plan, Lab Report, Business Plan]

My assignment brief and marking criteria:
[PASTE YOUR FULL BRIEF AND MARKING CRITERIA HERE]

Follow this exact process:

STAGE 1 - IDENTIFY TYPE AND APPLY CORRECT STRUCTURE
Based on the assignment type, apply the standard academic structure for that type.

If Essay: Introduction -> Main Arguments (2-4 body paragraphs) -> Counter-argument -> Conclusion
If Report: Executive Summary -> Introduction -> Findings -> Analysis -> Recommendations -> Conclusion -> References
If Case Study: Introduction -> Background -> Problem Identification -> Analysis (frameworks) -> Recommendations -> Conclusion
If Literature Review: Introduction -> Thematic Sections -> Gaps in Literature -> Conclusion
If Reflective Writing: Description -> Feelings -> Evaluation -> Analysis -> Conclusion -> Action Plan (Gibbs or Kolb)
If Dissertation Chapter: Follow the exact chapter structure from the brief
If Presentation Plan: Slide-by-slide plan with title, key points, speaker notes, visual suggestion
If Lab Report: Abstract -> Introduction -> Method -> Results -> Discussion -> Conclusion -> References
If Business Plan: Executive Summary -> Market Analysis -> Products/Services -> Marketing Strategy -> Financial Plan -> Conclusion
For any other type: apply the most appropriate academic structure based on the brief.

STAGE 2 - ANALYSE THE BRIEF AGAINST THE STRUCTURE
Read the marking criteria and confirm which sections carry the most marks, what the examiner is specifically looking for, word count distribution, referencing style, and any required frameworks or models. Present your understanding and wait for my confirmation.

STAGE 3 - BUILD THE SECTION-BY-SECTION OUTLINE
Create a detailed outline with every section heading, one sentence per section, approximate word count, and key frameworks or theories per section. Wait for my approval before writing.

STAGE 4 - WRITE ONE SECTION AT A TIME
Write Section 1 only. End with: Section complete. Ready to move to [next section name]? Wait for confirmation before the next section. Follow the approved outline. Use academic language and the required referencing style.

STAGE 5 - AFTER EACH SECTION
State the word count. Confirm it meets the marking criteria. Flag if any additional source or detail is needed.

RULES:
- Never write more than one section at a time without my confirmation
- Always apply the correct structure for the assignment type
- Follow the brief and marking criteria exactly
- Use in-text citations in the required referencing style throughout
- Do not produce the reference list until I ask for it at the end
$prompt$,
    array[
      'essay',
      'report',
      'case study',
      'reflection',
      'literature review',
      'dissertation',
      'lab report',
      'business plan',
      'section by section',
      'specific',
      'marking criteria'
    ]
  ),
  (
    '80000000-0000-0000-0000-000000000003',
    'Assignment Intelligence Prompt',
    'Academic Planning',
    $prompt$
Assignment Intelligence Prompt

I am going to paste my assignment brief below. Your job is to read it completely, extract every important detail from it, suggest or confirm the topic, build a perfect outline, and then wait for my approval before writing anything.

My assignment brief:
[PASTE YOUR FULL ASSIGNMENT BRIEF AND MARKING CRITERIA HERE]

---

STAGE 1 - FULL BRIEF EXTRACTION
Read the entire brief carefully and extract the following. Present everything in a clean numbered list:

1. Assignment Type
   What kind of assignment is this? (Essay, Report, Case Study, Literature Review, Reflective Writing, Dissertation, Presentation, Lab Report, Business Plan, or other)

2. Subject and Module
   What is the subject, course, or module name?

3. Academic Level
   What level is this? (Undergraduate Year 1/2/3, Postgraduate, Masters, PhD, or not specified)

4. Total Word Count
   What is the total word count required?

5. Referencing Style
   What referencing style is required? (Harvard, APA, Chicago, Vancouver, or not specified)

6. Submission Format
   What format is required? (Word document, PDF, slides, report, portfolio, or not specified)

7. Deadline or Submission Date
   Is a deadline mentioned? If yes, state it. If not, write "Not specified."

8. Key Requirements from the Marking Criteria
   List every criterion being marked and its weighting or importance if stated.

9. Specific Instructions
   List any specific rules, restrictions, models, frameworks, or theories the brief requires.

10. What Is Present in the Brief
    List everything that is clearly given - topic, data, case, scenario, question, or any content already provided.

11. What Is Missing from the Brief
    List anything important that is NOT stated - topic, dataset, specific question, framework, or any detail that is unclear or absent.

---

STAGE 2 - TOPIC IDENTIFICATION OR SUGGESTION
Based on what you extracted:

If the topic is clearly given in the brief:
- State the exact topic
- Confirm the essay question or research question if present
- Suggest a refined academic title if the brief does not provide one

If the topic is open or not given:
- Suggest 3 strong topic options relevant to the subject and assignment type
- For each topic suggestion provide:
  a. Topic name
  b. Suggested academic title (10 to 15 words)
  c. One sentence explaining why this topic scores well against the marking criteria
  d. Feasibility note - are sources easily available for this topic?
- After listing all 3 options, recommend the strongest one with a clear reason

End Stage 2 by asking: "Which topic would you like to proceed with? Please confirm or choose an option."

Wait for my confirmation before continuing.

---

STAGE 3 - WORD COUNT DISTRIBUTION PLAN
After topic is confirmed, create a word count plan:
- List every section of the assignment
- Assign an approximate word count to each section
- Total must match the required word count
- Show which sections carry the most marks and deserve more words
- Present as a table: Section | Word Count | Marks Focus

---

STAGE 4 - PERFECT OUTLINE
Build a complete section-by-section outline:
- Every section heading
- Under each heading: 2 to 4 bullet points describing exactly what that section will cover
- Any specific framework, model, theory, or source type required in that section
- Based on what was given in the brief - do not invent requirements not in the brief
- If the brief does not specify structure, apply the standard academic structure for the assignment type

Present the full outline and ask: "Does this outline look correct? Should I adjust anything before I start writing?"

Wait for my approval before writing a single word of the assignment.

---

RULES:
- Do not start writing the assignment until I have approved the outline
- Do not assume a topic without offering options if the topic is open
- Do not skip the extraction stage - it must always come first
- Always base the outline on what the brief actually requires
- If anything in the brief is unclear, flag it in Stage 1 under "What Is Missing"
- Never produce a reference list unless I ask for it
$prompt$,
    array[
      'assignment intelligence',
      'brief analysis',
      'topic selection',
      'outline',
      'word count',
      'marking criteria',
      'academic planning',
      'requirements extraction'
    ]
  ),
  (
    '80000000-0000-0000-0000-000000000004',
    'Assignment Intelligence Prompt',
    'Academic Planning',
    $prompt$
Assignment Intelligence Prompt

I am going to paste my assignment brief below. Your job is to read it completely, extract every important detail from it, suggest or confirm the topic, build a perfect outline, and then wait for my approval before writing anything.

My assignment brief:
[PASTE YOUR FULL ASSIGNMENT BRIEF AND MARKING CRITERIA HERE]

STAGE 1 - FULL BRIEF EXTRACTION
Read the entire brief and extract:
1. Assignment Type
2. Subject and Module
3. Academic Level
4. Total Word Count
5. Referencing Style
6. Submission Format
7. Deadline or Submission Date
8. Key Requirements from the Marking Criteria (with weightings if stated)
9. Specific Instructions (models, frameworks, theories required)
10. What Is Present in the Brief (topic, data, case, scenario, question)
11. What Is Missing from the Brief (anything unclear or not stated)

STAGE 2 - TOPIC IDENTIFICATION OR SUGGESTION
If topic is given: confirm it and suggest a refined academic title.
If topic is open: suggest 3 strong topic options each with:
a. Topic name
b. Suggested academic title (10 to 15 words)
c. Why it scores well against the marking criteria
d. Feasibility note on source availability
Recommend the strongest option. Wait for my confirmation before continuing.

STAGE 3 - WORD COUNT DISTRIBUTION PLAN
After topic confirmed, create a table:
Section | Word Count | Marks Focus
Total must match the required word count.

STAGE 4 - PERFECT OUTLINE
Build a complete section-by-section outline:
- Every section heading
- 2 to 4 bullet points per section describing exactly what it will cover
- Any framework, model, or theory required in that section
- Based strictly on the brief - do not invent requirements
Wait for my approval before writing anything.

RULES:
- Do not start writing until outline is approved
- Do not assume a topic if it is open - always offer options
- Always extract the brief fully in Stage 1 first
- Flag anything missing or unclear in Stage 1 Point 11
- Never produce a reference list unless I ask for it
$prompt$,
    array[
      'brief analysis',
      'topic suggestion',
      'word count',
      'outline',
      'academic planning',
      'all rounder',
      'essay',
      'report',
      'dissertation',
      'case study',
      'marking criteria',
      'planning first'
    ]
  )
on conflict (id) do update
set
  title = excluded.title,
  category = excluded.category,
  content = excluded.content,
  tags = excluded.tags,
  updated_at = now();
