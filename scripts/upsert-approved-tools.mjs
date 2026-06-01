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
].map(tool => ({
  ...tool,
  usage_count: 0,
  active_students: 0,
  related_problems: 0,
  success_rate: 100,
}))

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
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

console.log(data.map(row => row.tool_name).join("\n"))
