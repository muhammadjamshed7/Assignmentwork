import { readFile } from "node:fs/promises"
import { createClient } from "@supabase/supabase-js"

const envText = await readFile(".env.local", "utf8")
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#") && line.includes("="))
    .map(line => {
      const index = line.indexOf("=")
      return [line.slice(0, index), line.slice(index + 1)]
    })
)

const tools = [
  {
    id: "70000000-0000-0000-0000-000000000001",
    tool_name: "ChatGPT",
    description: `Official link: https://chatgpt.com

Benefits:
- Strong general-purpose assistant for planning, drafting, analysis, coding, and explanations.
- Useful for turning rough requirements into structured tasks, checklists, and polished outputs.
- Good first-pass tool for brainstorming, rewriting, summarizing, and step-by-step problem solving.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000002",
    tool_name: "Claude Opus",
    description: `Official link: https://claude.ai

Benefits:
- Strong for careful long-form writing, deep reasoning, document review, and complex coding support.
- Useful when quality, nuance, and structured analysis matter more than quick short answers.
- Claude's free plan is available for general Claude use; Opus access may depend on the current Claude plan and availability.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000003",
    tool_name: "Google Gemini",
    description: `Official link: https://gemini.google.com

Benefits:
- Useful for everyday research, writing, summaries, brainstorming, and productivity workflows.
- Strong fit when Google ecosystem context is useful, such as Search, YouTube, Maps, Gmail, Docs, or Drive workflows.
- Supports multimodal assistance depending on account, plan, region, and current Gemini app availability.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000004",
    tool_name: "Grok",
    description: `Official link: https://grok.com

Benefits:
- Useful for fast conversational answers, reasoning, coding help, and current-context exploration.
- Helpful for X/social-context research workflows when used through supported Grok/X surfaces.
- Developer workflows can use xAI API access where available.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000005",
    tool_name: "Perplexity",
    description: `Official link: https://www.perplexity.ai

Benefits:
- Strong for web research, source discovery, and citation-backed answers.
- Useful for quickly checking current information before writing or making decisions.
- Good fit for comparing sources, finding references, and moving from question to verified direction.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000006",
    tool_name: "Google AI Studio",
    description: `Official link: https://aistudio.google.com/apps

Benefits for end-to-end work:
- Build AI-powered apps quickly from prompts using Gemini.
- Prototype multimodal workflows across text, image, video, audio, and tool/search use cases.
- Use starter apps, the app gallery, and a built-in code editor to remix, save, share, and integrate code.
- Get Gemini API keys for moving from prototype toward real app integration.
- Use logs and datasets to debug model calls, evaluate quality, refine prompts, and track behavior from prototype to production.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000007",
    tool_name: "LMArena",
    description: `Official link: https://lmarena.ai

Benefits:
- Useful free/quick arena for comparing different frontier LLM outputs side by side where models are available.
- Helps decide which model is better for a prompt before committing time or paid usage elsewhere.
- Includes leaderboard and battle-style comparison workflows.
- Privacy note: do not submit sensitive, private, or client data because arena conversations may be processed by third-party AI providers.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000020",
    tool_name: "Google NotebookLM",
    description: `Official link: https://notebooklm.google

Category: AI Research Tool & Thinking Partner

Benefits:
- Helps turn uploaded sources into study notes, summaries, outlines, FAQs, and research-friendly explanations.
- Useful for working with lecture notes, PDFs, articles, reports, and source collections in one grounded notebook.
- Good fit for academic research, assignment planning, source understanding, and revision support.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000021",
    tool_name: "Napkin AI",
    description: `Official link: https://www.napkin.ai

Category: Visual AI for Business Storytelling

Benefits:
- Turns business ideas, notes, and written concepts into clear visuals for storytelling and presentations.
- Useful for diagrams, frameworks, process visuals, strategy explanations, and slide-ready communication.
- Good fit for business, MBA/BBA, marketing, strategy, and presentation planning tasks.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000022",
    tool_name: "NoteGPT",
    description: `Official link: https://notegpt.io

Category: All-in-One AI Learning Assistant

Benefits:
- Helps summarize lectures, videos, PDFs, and study materials into clearer notes and deep summaries.
- Useful for listening on the go, translating PDFs, creating visuals for notes, and getting instant AI help.
- Good fit for studying smarter, reviewing academic material, and turning learning content into reusable notes.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000008",
    tool_name: "Custom GPT AI Humanizer",
    description: `Alternative Name: Custom GPT AI Humanizer
Category: Writing Tools / AI Humanizing / Rewriting
Official Link: https://chatgpt.com/g/g-2azCVmXdy-ai-humanizer

Short Description:
A custom ChatGPT-based AI humanizer designed to rewrite AI-generated text into a more natural, readable, and human-like style.

Recommended Use:
Humanizing assignment drafts, improving sentence flow, rewriting robotic text, and making academic writing sound more natural.

Student Note / Academic Integrity Note:
Use for refinement only. The final work must still be checked, edited, understood, and ethically submitted by the student.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000018",
    tool_name: "HumanizeAI Pro",
    description: `Alternative Name: Humanize AI Pro
Category: Writing Tools / AI Humanizing / Rewriting
Official Link: https://www.humanizeai.pro/

Short Description:
HumanizeAI Pro is an AI humanizing tool used to rewrite AI-generated text into clearer, smoother, and more natural writing.

Recommended Use:
Humanizing AI-assisted assignment drafts, improving fluency, polishing essays, and refining academic writing tone.

Student Note / Academic Integrity Note:
Use this tool for readability and language refinement only. The student must verify accuracy, originality, and assignment compliance before submission.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000019",
    tool_name: "SuperHumanizer AI",
    description: `Alternative Name: Super Humanizer AI
Category: Writing Tools / AI Humanizing / Rewriting
Official Link: https://superhumanizer.ai/

Short Description:
SuperHumanizer AI helps rewrite AI-generated content into more natural, human-like writing with improved flow and readability.

Recommended Use:
Rewriting AI-generated paragraphs, improving natural tone, and refining assignment drafts before final editing.

Student Note / Academic Integrity Note:
Use for writing polish only. Do not use it as a replacement for understanding, editing, or producing academically responsible work.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000009",
    tool_name: "WriteHuman AI",
    description: `Alternative Name: Write Human
Category: Writing Tools / AI Humanizing / Rewriting
Official Link: https://writehuman.ai/

Short Description:
WriteHuman AI rewrites AI-generated text into smoother, more natural, conversational writing while preserving the original meaning.

Recommended Use:
Humanizing ChatGPT, Gemini, Grok, Claude, or other AI-generated text before final editing.

Student Note / Academic Integrity Note:
Best for improving tone and readability in essays, reports, and general academic writing. Students must review and take responsibility for the final content.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000010",
    tool_name: "GPTHuman AI",
    description: `Alternative Name: GPT Human AI
Category: Writing Tools / AI Humanizing / Rewriting
Official Link: https://gpthuman.ai/

Short Description:
GPTHuman AI is an AI humanizer that rewrites AI-generated text into more natural, human-like writing.

Recommended Use:
Essay rewriting, assignment text polishing, and improving readability of AI-assisted drafts.

Student Note / Academic Integrity Note:
Use only after the student has reviewed the meaning, accuracy, and academic quality of the content.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000011",
    tool_name: "WalterWrites",
    description: `Alternative Names: Walter AI, Walterai Humanizer
Category: Writing Tools / AI Humanizing / Rewriting
Official Link: https://walterwrites.ai/

Short Description:
WalterWrites helps humanize, detect, and rewrite AI-generated content while preserving the writer's voice.

Recommended Use:
Rewriting AI-assisted drafts, improving natural tone, checking AI-likelihood, and preserving writing style.

Student Note / Academic Integrity Note:
Useful when the goal is to keep the student's original voice while improving clarity and fluency. Do not use to misrepresent authorship.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000012",
    tool_name: "StealthWriter",
    description: `Alternative Name: Stealth Writer
Category: AI Remover / Stealth Tools
Official Link: https://stealthwriter.ai/

Short Description:
StealthWriter rewrites AI-generated content into more natural, polished, human-like writing.

Recommended Use:
Refining robotic AI text, improving assignment readability, and making writing sound more natural.

Student Note / Academic Integrity Note:
Use for language improvement and readability, not for dishonest submission.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000013",
    tool_name: "StealthGPT",
    description: `Alternative Name: Stealth GPT
Category: AI Remover / Stealth Tools
Official Link: https://www.stealthgpt.ai/

Short Description:
StealthGPT is an AI rewriting and humanizing platform for transforming AI-generated content into more natural writing.

Recommended Use:
Rewriting AI-generated drafts, improving sentence variation, and refining tone.

Student Note / Academic Integrity Note:
Final text must be reviewed for accuracy, originality, and compliance with assignment rules.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000014",
    tool_name: "AuraWrite AI",
    description: `Alternative Name: AuraWrite
Category: Writing Tools / AI Humanizing / Rewriting
Official Link: https://aurawriteai.com/

Short Description:
AuraWrite AI humanizes AI-generated text by improving fluency, tone, sentence structure, and natural readability.

Recommended Use:
Academic writing refinement, essay polishing, rewriting AI-generated drafts, and improving clarity.

Student Note / Academic Integrity Note:
Suitable for improving natural language quality after the assignment content is already understood and prepared.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000015",
    tool_name: "DigitalMagicWand",
    description: `Alternative Name: Digital Magic Wand
Category: Writing Tools / AI Humanizing / Rewriting
Official Link: https://digitalmagicwand.com/ai-humanizer

Short Description:
DigitalMagicWand provides an AI humanizer for rewriting machine-generated text into more natural writing.

Recommended Use:
Rewriting AI-generated paragraphs, improving natural flow, and refining assignment text.

Student Note / Academic Integrity Note:
Use for readability improvement only. Do not use as a substitute for learning or original academic work.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000016",
    tool_name: "Undetectable AI",
    description: `Alternative Name: Undetectable.ai
Category: AI Remover / Stealth Tools
Official Link: https://undetectable.ai/

Short Description:
Undetectable AI provides AI detection and humanizing tools that rewrite AI-generated text into more natural writing.

Recommended Use:
Checking and refining AI-assisted writing, improving tone, and making text more readable.

Student Note / Academic Integrity Note:
Use carefully and ethically. The final assignment must remain accurate, properly reviewed, and compliant with academic rules.`,
  },
  {
    id: "70000000-0000-0000-0000-000000000017",
    tool_name: "BypassGPT",
    description: `Alternative Name: Bypass GPT
Category: AI Remover / Stealth Tools
Official Link: https://www.bypassgpt.ai/

Short Description:
BypassGPT rewrites AI-generated text into more natural, human-like writing.

Recommended Use:
Rewriting AI-generated drafts, improving conversational tone, and polishing assignment content.

Student Note / Academic Integrity Note:
Must be used only for refinement and readability improvement, not for academic misconduct.`,
  },
].map(tool => ({
  ...tool,
  usage_count: 0,
  active_students: 0,
  related_problems: 0,
  success_rate: 100,
}))

if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required to upsert tools. The anon key does not have write access.")
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const { data, error } = await supabase
  .from("ai_tools")
  .upsert(tools, { onConflict: "tool_name" })
  .select("tool_name")
  .order("tool_name")

if (error) {
  throw error
}

console.log((data ?? []).map(row => row.tool_name).join("\n"))
