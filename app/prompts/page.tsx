"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { BookOpen, ChevronDown, Copy, EllipsisVertical, Eye, Pencil, PlusCircle, Search, Share2, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToastStore } from "@/store/useToastStore"
import { Prompt } from "@/lib/data/types"
import { createPrompt, deletePrompt, listPromptById, listPromptsPage, updatePrompt } from "@/lib/data/prompts"
import { listCourses } from "@/lib/data/courses"
import { ErrorState, LoadingState, useSupabaseQuery } from "@/lib/data/hooks"
import { getErrorMessage } from "@/lib/data/client"
import { useSearchStore } from "@/store/useSearchStore"
import { useCurrentUserRole } from "@/lib/auth/use-current-user-role"
import { PaginationControls } from "@/components/ui/pagination-controls"

const PROMPT_CATEGORIES = [
  "Voice and Image requirements",
  "Academic Planning",
  "Presentation Planning",
  "Cybersecurity",
  "MBA / Business",
  "BBA / Business Studies",
  "Computer Science / IT",
  "Marketing",
  "Presentation",
  "Assignment",
  "Research",
  "Literature Review",
  "Case Study",
  "Business Strategy",
  "Expert Role",
  "Methodology",
  "Proposal",
  "Thesis",
  "Data Extraction",
  "Reference Memory",
  "Remake",
  "Feedback",
  "General",
]

const EMPTY_PROMPT_FORM = {
  title: "",
  category: "General",
  relatedCourseId: "",
  tags: "",
  content: "",
}

const PAGE_SIZE = 10

const SUBJECT_PROMPT_FILTERS = [
  "All",
  "Voice and Image requirements",
  "Academic Planning",
  "Presentation Planning",
  "Cybersecurity",
  "MBA / Business",
  "BBA / Business Studies",
  "Computer Science / IT",
  "Marketing",
]

const subjectWisePrompts = [
  {
    title: "Voice and Image Requirements Prompt",
    category: "Voice and Image requirements",
    description:
      "Use this prompt when assignment requirements arrive as images, Urdu text, Roman Urdu, English text, or voice-note transcription.",
    tags: ["voice notes", "images", "Urdu", "Roman Urdu", "requirements clarification", "assignment brief"],
    content: `I have received assignment requirements in different formats, including images, Urdu text, Roman Urdu, English text, and voice-note transcription. I will submit the requirements to you one by one.

Your task at this stage is only to understand the requirements. Do not start solving the assignment yet.

Follow these rules strictly:

1. Do not make any assumptions from your side.
2. If anything is unclear, missing, incomplete, or ambiguous, ask me cross-questions.
3. If I provide Urdu or Roman Urdu text, understand it properly and respond in English.
4. After each requirement, tell me clearly what you understood.
5. Identify the assignment objective, required task, expected output, formatting requirements, citation/reference requirements, and any technical/setup/installation steps if mentioned.
6. Do not skip any instruction.
7. Do not add extra requirements that are not present in the provided material.
8. Do not begin the final answer until all requirements are fully clarified.
9. If I do not know the answers to your clarification questions, or if I am unsure about the expected output, guide me through the process step by step instead of stopping.
10. If a task requires using any software, website, tool, or platform, explain every required action clearly.
11. If I need to click somewhere, select an option, upload a file, open a menu, install something, configure a setting, or perform any technical step, guide me with proper arrows.
12. Your guidance should be written like this where needed:

Open the software → Click on “File” → Select “Upload” → Choose the required file → Click “Submit”

13. Do not assume that I already know how to use the required software or tool.
14. If there are multiple possible methods, ask me which method/tool I am using before giving software-specific instructions.
15. If the assignment requires a specific output but I do not know what that output should look like, first explain the possible output format, then ask me to confirm which one is required.
16. If I cannot confirm, proceed with the safest academically appropriate format and clearly state that this is based only on the provided requirement, not on an assumption.

For every requirement I submit, respond in this structure:

A. What I understood
B. Main assignment objective
C. Required output
D. Formatting or style requirements
E. Technical/setup/installation requirements, if any
F. Missing or unclear information
G. Cross-questions for clarification
H. Step-by-step guidance needed from the user, if the user does not know the answer
I. Software/tool navigation steps, if any, using proper arrows

Once I confirm that all requirements are clear, then create the assignment step by step without missing any instruction. `,
  },
  {
    title: "General Assignment Brief Analysis",
    category: "Academic Planning",
    description:
      "Use this prompt before starting any essay, report, case study, or academic assignment. It breaks down the brief and gives a high-marks strategy.",
    tags: ["assignment brief", "rubric", "topic selection", "referencing", "structure", "high marks"],
    content: `You are a professor-level academic assignment expert with deep experience in helping students understand assignment briefs and plan high-scoring academic work.

I will paste my assignment brief below. Before writing anything, analyze the brief deeply and give me TWO outputs.

PART 1 - BRIEF BREAKDOWN FOR MY UNDERSTANDING

Explain the assignment brief clearly and accurately.

Cover the following:

1. What is exactly being asked?
2. Is this an essay, report, case study, reflection, presentation, technical task, coding task, or practical assignment?
3. Is the topic already given, or do I have to choose from options?
4. If topic options are given, list all available topic options.
5. If I can choose my own topic, explain what type of topic would be suitable.
6. What referencing style is required? For example APA 7th, Harvard, MLA, IEEE, Chicago, or any other.
7. What word count, page limit, or time limit is required?
8. What structure or headings are required?
9. What files, tools, screenshots, datasets, code, or evidence are required?
10. What does the marking rubric actually expect?
11. What hidden requirements might students miss?
12. What final deliverables must be submitted?

PART 2 - 90-95% MARKS STRATEGY

Based on the brief, give me a high-marks strategy.

Cover the following:

1. Best topic recommendation, if topic choice is available.
2. Best academic angle, thesis, argument, or approach.
3. Best structure to follow.
4. Key theories, frameworks, models, or concepts to include.
5. What examples, case studies, data, or evidence will strengthen the work.
6. What references or source types should be used.
7. What common mistakes must be avoided.
8. What steps should I follow to produce distinction-level work.
9. What will make this assignment stand out from average submissions.
10. Final checklist before writing.

Do not write the final assignment yet.

First give only:
1. Brief Breakdown
2. High-Marks Strategy
3. Recommended Next Step

BRIEF STARTS BELOW:`,
  },
  {
    title: "Presentation Planning Prompt",
    category: "Presentation Planning",
    description:
      "Use this prompt when the assignment requires slides, PowerPoint, oral presentation, or a presentation plan.",
    tags: ["presentation", "slides", "PowerPoint", "academic presentation", "high marks"],
    content: `You are a world-class presentation strategist and academic expert with 20+ years of experience helping students prepare top-grade academic presentations.

I will paste my assignment brief below. Analyze it deeply and create a complete presentation plan.

PART 1 - PRESENTATION BRIEF ANALYSIS

Explain:

1. What is exactly being asked?
2. Is this an individual or group presentation?
3. Is there a time limit?
4. Is there a required number of slides?
5. Is there a required topic, or do I need to select one?
6. What marking criteria apply?
7. What hidden requirements might students miss?
8. What academic level and tone are required?

PART 2 - SLIDE COUNT AND STRUCTURE

Tell me exactly how many slides I should create and why.

Then provide a slide-by-slide plan:

SLIDE [NUMBER]: [TITLE]
-> Purpose of the slide
-> Exact content to include
-> Recommended number of bullet points
-> Visual/chart/image suggestion
-> Speaker notes summary
-> Time to spend on the slide, if presenting live

PART 3 - CONTENT THAT WINS MARKS

Explain:

1. What unique angle should I use?
2. What examples, case studies, statistics, theories, or frameworks should I include?
3. What should be shown visually instead of written as text?
4. What will make the presentation look professional?
5. What will impress the examiner?

PART 4 - DESIGN STRATEGY

Recommend:

1. Colour scheme
2. Font style
3. Slide layout
4. Visual style
5. Maximum text per slide
6. Where to use diagrams, charts, icons, or screenshots

PART 5 - 90-95% MARKS GAME PLAN

Give:

1. Step-by-step plan to build the presentation.
2. Top 5 mistakes to avoid.
3. Delivery tips if this is a live presentation.
4. Final checklist before submission or presentation.

Do not create the final slides yet. First give only the complete presentation plan.

BRIEF STARTS BELOW:`,
  },
  {
    title: "Presentation PPT and Slide Content Prompt",
    category: "Presentation Planning",
    description:
      "Use this staged prompt to analyze a presentation brief first, then build either downloadable PPT guidance or slide content after the user confirms.",
    tags: ["presentation", "PPT", "slide content", "PowerPoint", "speaker notes", "READY workflow", "high marks"],
    content: `You are a world-class presentation strategist and academic expert with 20+ years of experience helping students create top-grade academic presentations.

I am going to paste my assignment brief below. Your job is to:

STEP 1 — Read and scan the entire brief carefully.
STEP 2 — Analyze it across these 8 dimensions:
  1. What is exactly being asked?
  2. Individual or group presentation?
  3. Is there a time limit?
  4. Required number of slides?
  5. Is the topic given or do I choose?
  6. What are the marking criteria?
  7. What hidden requirements might students miss?
  8. What academic level and tone are required?

STEP 3 — After your analysis, do NOT generate slides yet.
Instead, end your response with this exact line:
"✅ Analysis complete. Type READY when you want me to build the full slide-by-slide presentation plan and generate your PPT."

STEP 4 — Wait for me to type READY.

STEP 5 — When I type READY, ask me ONE question first:
"Do you want me to generate a downloadable PPT file, or just the slide content as text?"

STEP 6 — Then generate the complete presentation based on my answer, including:
  • Full slide-by-slide breakdown (title, content, visuals, speaker notes, time per slide)
  • Design strategy (colors, fonts, layout)
  • Content that wins marks (examples, frameworks, statistics, visuals)
  • 90–95% marks game plan (steps, mistakes to avoid, delivery tips, final checklist)

---

MY ASSIGNMENT BRIEF STARTS BELOW:

[PASTE YOUR BRIEF HERE]`,
  },
  {
    title: "Cybersecurity Academic Prompt",
    category: "Cybersecurity",
    description:
      "Use this prompt for cybersecurity essays, reports, case studies, practical labs, Kali Linux tasks, or security analysis assignments.",
    tags: ["cybersecurity", "ethical hacking", "network security", "Kali Linux", "NIST", "MITRE", "ISO 27001"],
    content: `You are a world-class Cybersecurity academic expert and industry professional with 20+ years of experience in offensive security, defensive security, digital forensics, governance, risk, compliance, and academic cybersecurity writing.

I will paste my cybersecurity assignment brief below. Analyze it deeply before writing anything.

PART 1 - BRIEF ANALYSIS

Explain:

1. What is exactly being asked?
2. Is this theoretical, practical, technical, or mixed?
3. Is it an essay, report, case study, lab report, risk assessment, security audit, penetration testing task, or incident analysis?
4. What topic is given, or what topic should be selected?
5. What referencing style, word count, structure, and deliverables are required?
6. What tools are required, such as Kali Linux, Nmap, Wireshark, Metasploit, Burp Suite, Autopsy, Splunk, or SIEM tools?
7. What screenshots, logs, commands, tables, or evidence are needed?
8. What hidden requirements might students miss?

PART 2 - CYBERSECURITY CONTENT STRATEGY

Recommend:

1. Relevant frameworks: NIST CSF, ISO 27001, MITRE ATT&CK, CIA Triad, Cyber Kill Chain, OWASP, GDPR, risk management frameworks.
2. Relevant real-world examples: WannaCry, SolarWinds, Log4Shell, Colonial Pipeline, MOVEit, phishing, ransomware, cloud breaches.
3. Technical terms that must appear.
4. Whether the answer needs threat modelling, vulnerability analysis, risk scoring, mitigation planning, or compliance discussion.
5. What diagrams, tables, attack flows, or evidence should be included.

PART 3 - STRUCTURE

Give a section-by-section structure:

SECTION [NUMBER]: [TITLE]
-> Purpose
-> Exact content to include
-> Word count allocation
-> Framework/tool/evidence to use
-> Expected academic value

PART 4 - 90-95% MARKS STRATEGY

Explain:

1. The strongest technical angle.
2. The strongest critical analysis angle.
3. What will separate this from average cybersecurity submissions.
4. Top mistakes to avoid.
5. Step-by-step plan to complete the assignment.

Do not write the final assignment yet. First give only the analysis, structure, tool plan, and high-marks strategy.

BRIEF STARTS BELOW:`,
  },
  {
    title: "MBA / Business Academic Prompt",
    category: "MBA / Business",
    description:
      "Use this prompt for MBA reports, business case studies, strategy assignments, management analysis, leadership, HRM, operations, or entrepreneurship tasks.",
    tags: ["MBA", "business", "management", "strategy", "case study", "leadership", "operations"],
    content: `You are a world-class MBA professor and senior business consultant with 20+ years of experience in strategy, leadership, marketing, operations, finance, HRM, entrepreneurship, and business transformation.

I will paste my MBA or business assignment brief below. Analyze it deeply before writing anything.

PART 1 - BRIEF ANALYSIS

Explain:

1. What is exactly being asked?
2. Is this a business report, essay, case study, reflective writing, business plan, strategy analysis, or consultancy report?
3. What company, industry, case, or topic is given?
4. If I must choose a company or topic, recommend the strongest option.
5. What referencing style, word count, structure, and deliverables are required?
6. What does the marking rubric reward?
7. What hidden requirements might students miss?

PART 2 - BUSINESS CONTENT STRATEGY

Recommend:

1. Best business frameworks to use: SWOT, PESTLE, Porter's Five Forces, Ansoff Matrix, BCG Matrix, VRIO, Balanced Scorecard, Business Model Canvas, McKinsey 7S.
2. Relevant business theories and theorists: Porter, Kotler, Drucker, Mintzberg, Barney, Schein, Lewin, Kotter.
3. Real company examples to include.
4. Latest trends: ESG, digital transformation, AI in business, sustainability, platform economy, remote work, innovation, customer experience.
5. What financial, strategic, operational, or managerial evidence should be included.

PART 3 - STRUCTURE

Give a section-by-section structure:

SECTION [NUMBER]: [TITLE]
-> Purpose
-> Exact content to include
-> Word count allocation
-> Framework/theory to apply
-> Evidence or company example to use

PART 4 - DISTINCTION STRATEGY

Explain:

1. The strongest business argument.
2. The best critical analysis angle.
3. What will make the work look like a consultancy-level submission.
4. Top mistakes MBA students make and how to avoid them.
5. Step-by-step action plan.

Do not write the final assignment yet. First give only the brief analysis, structure, framework plan, and distinction strategy.

BRIEF STARTS BELOW:`,
  },
  {
    title: "BBA / Business Studies Prompt",
    category: "BBA / Business Studies",
    description:
      "Use this prompt for undergraduate business assignments, management essays, business reports, entrepreneurship tasks, and business case studies.",
    tags: ["BBA", "business studies", "management", "marketing", "HRM", "entrepreneurship"],
    content: `You are a senior Business Studies academic expert with 20+ years of teaching and consulting experience in undergraduate business, management, marketing, HRM, entrepreneurship, and organizational studies.

I will paste my BBA or Business Studies assignment brief below. Analyze it clearly and help me plan a high-scoring answer.

PART 1 - BRIEF ANALYSIS

Explain:

1. What is exactly being asked?
2. Is this an essay, report, case study, presentation, reflection, business plan, or research task?
3. What topic, company, or business issue is given?
4. If I need to choose a topic, recommend the best one.
5. What referencing style, word count, structure, and submission format are required?
6. What does the marking rubric expect?
7. What are the hidden requirements?

PART 2 - CONTENT STRATEGY

Recommend:

1. Business concepts to include.
2. Suitable frameworks such as SWOT, PESTLE, 4Ps, 7Ps, Porter's Five Forces, SMART objectives, Maslow, Herzberg, or leadership theories.
3. Real-world company examples.
4. Academic theories and sources to use.
5. Tables, diagrams, or examples that can improve marks.

PART 3 - STRUCTURE

Give a clear section-by-section structure:

SECTION [NUMBER]: [TITLE]
-> Purpose
-> What to write
-> Approximate word count
-> Theory/framework/example to use

PART 4 - HIGH-MARKS PLAN

Explain:

1. What will make the assignment strong.
2. What critical points must be included.
3. What common mistakes should be avoided.
4. What steps I should follow before writing.
5. Final checklist for high marks.

Do not write the final assignment yet. First give only the analysis, structure, and high-marks plan.

BRIEF STARTS BELOW:`,
  },
  {
    title: "Computer Science / IT Prompt",
    category: "Computer Science / IT",
    description:
      "Use this prompt for CS/IT reports, programming tasks, software engineering assignments, system design, database work, cloud, AI, or technical documentation.",
    tags: ["computer science", "IT", "programming", "software engineering", "system design", "database", "cloud"],
    content: `You are a world-class Computer Science and IT academic expert with 20+ years of experience in software engineering, programming, databases, networks, cloud computing, AI, cybersecurity, systems analysis, and academic technical writing.

I will paste my CS/IT assignment brief below. Analyze it deeply before writing or coding anything.

PART 1 - BRIEF ANALYSIS

Explain:

1. What is exactly being asked?
2. Is the assignment theoretical, practical, coding-based, report-based, or mixed?
3. Is it a programming task, software design, database task, networking task, AI/ML task, cloud task, web development task, or research assignment?
4. What deliverables are required: report, source code, screenshots, diagrams, GitHub link, database file, video, or presentation?
5. What programming language, tool, IDE, framework, or platform is required?
6. What referencing style, word count, structure, and format are required?
7. What hidden requirements might students miss?

PART 2 - TECHNICAL CONTENT STRATEGY

Recommend:

1. Relevant CS concepts, theories, or algorithms.
2. Required diagrams: UML, ERD, flowchart, architecture diagram, sequence diagram, class diagram, use-case diagram.
3. Required tools: VS Code, Jupyter Notebook, Google Colab, GitHub, Docker, MySQL, PostgreSQL, MongoDB, Node.js, React, Python, Java, C++, or cloud platforms.
4. Testing strategy, validation method, or implementation plan.
5. What screenshots or outputs should be captured.
6. What latest technologies or examples can strengthen the work.

PART 3 - STRUCTURE

Give a section-by-section plan:

SECTION [NUMBER]: [TITLE]
-> Purpose
-> Exact content to include
-> Word count or technical output
-> Diagrams/code/evidence required
-> Expected academic value

PART 4 - 90-95% MARKS STRATEGY

Explain:

1. Strongest technical approach.
2. What will impress the examiner.
3. How to avoid shallow explanation.
4. Top mistakes CS/IT students make.
5. Step-by-step action plan before writing or coding.

Do not write the final assignment or code yet. First give only the analysis, technical plan, structure, and high-marks strategy.

BRIEF STARTS BELOW:`,
  },
  {
    title: "Marketing Academic Prompt",
    category: "Marketing",
    description:
      "Use this prompt for marketing essays, campaign plans, brand analysis, digital marketing reports, consumer behaviour, and market research assignments.",
    tags: ["marketing", "digital marketing", "consumer behaviour", "branding", "campaign", "STP", "4Ps"],
    content: `You are a world-class Marketing professor and brand strategist with 20+ years of experience in digital marketing, branding, consumer behaviour, market research, campaign planning, and academic marketing analysis.

I will paste my marketing assignment brief below. Analyze it deeply before writing anything.

PART 1 - BRIEF ANALYSIS

Explain:

1. What is exactly being asked?
2. Is this a marketing essay, report, campaign plan, brand analysis, case study, market research task, or presentation?
3. What brand, product, market, or topic is given?
4. If I need to choose a brand or topic, recommend the strongest option.
5. What referencing style, word count, structure, and deliverables are required?
6. What does the rubric reward?
7. What hidden requirements might students miss?

PART 2 - MARKETING CONTENT STRATEGY

Recommend:

1. Marketing frameworks: STP, 4Ps, 7Ps, AIDA, customer journey, brand equity, SOSTAC, RACE, SWOT, PESTLE.
2. Relevant theorists: Kotler, Keller, Chaffey, Fill, Aaker, Porter.
3. Real brand examples to include.
4. Latest trends: influencer marketing, AI marketing, personalization, omnichannel, social commerce, sustainability, customer experience.
5. What visuals, charts, campaign examples, or metrics should be included.

PART 3 - STRUCTURE

Give a section-by-section structure:

SECTION [NUMBER]: [TITLE]
-> Purpose
-> Exact content to include
-> Word count allocation
-> Framework/theory to apply
-> Brand example or evidence to use

PART 4 - 90-95% MARKS STRATEGY

Explain:

1. Strongest creative and analytical angle.
2. What will make the work stand out.
3. What unique insight should be added.
4. Top mistakes marketing students make.
5. Step-by-step action plan before writing.

Do not write the final assignment yet. First give only the brief analysis, structure, marketing strategy, and high-marks plan.

BRIEF STARTS BELOW:`,
  },
]

const writingStyleInstruction = {
  section: "Writing Style Instructions",
  dropdownTitle: "Instructions to Avoid AI",
  promptTitle: "Writing Style Prompt",
  description: "Use this prompt to make writing sound simple, natural, direct, and less artificial.",
  promptText: `Writing Style Prompt

Use simple language: Write plainly with short sentences.

Example: "I need help with this issue."

Avoid AI-giveaway phrases: Don't use cliches like "dive into," "unleash your potential," "game-changing," "revolutionary," or similar phrases.

Avoid: "Let's dive into this game-changing solution."

Use instead: "Here's how it works."

Be direct and concise: Get to the point. Remove unnecessary words.

Example: "We should meet tomorrow."

Maintain a natural tone: Write as you normally speak. It is okay to start sentences with "and" or "but."

Example: "And that's why it matters."

Avoid marketing language: Don't use hype or promotional words.

Avoid: "This revolutionary product will transform your life."

Use instead: "This product can help you."

Keep it real: Be honest. Don't force friendliness.

Example: "I don't think that's the best idea."

Simplify grammar: Don't stress about perfect grammar. It is fine not to capitalize "i" if that matches the required style.

Example: "i guess we can try that."

Stay away from fluff: Avoid unnecessary adjectives and adverbs.

Example: "We finished the task."

Focus on clarity: Make your message easy to understand.

Example: "Please send the file by Monday."`,
}

const selectClassName =
  "flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-gray-100/50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"

type PromptFormState = typeof EMPTY_PROMPT_FORM
type SubjectWisePrompt = (typeof subjectWisePrompts)[number]

const isVoiceAndImagePrompt = (prompt?: Pick<SubjectWisePrompt, "category"> | null) =>
  prompt?.category === "Voice and Image requirements"

function createPromptSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function getSubjectPromptSlug(prompt: SubjectWisePrompt) {
  return createPromptSlug(prompt.title)
}

function getUrlSearchParam(name: string) {
  if (typeof window === "undefined") return null
  return new URLSearchParams(window.location.search).get(name)
}

function getSharedSubjectPromptFromUrl() {
  const subjectPromptSlug = getUrlSearchParam("subjectPrompt")
  if (!subjectPromptSlug) return null

  return subjectWisePrompts.find(prompt => getSubjectPromptSlug(prompt) === subjectPromptSlug) ?? null
}

function toPromptForm(prompt: Prompt): PromptFormState {
  return {
    title: prompt.title,
    category: prompt.category,
    relatedCourseId: prompt.relatedCourseId ?? "",
    tags: prompt.tags.join(", "),
    content: prompt.content,
  }
}

function parseTags(value: string) {
  return value
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean)
}

function WorkflowArrow() {
  return <div className="my-3 text-center text-4xl font-bold leading-none text-blue-600">↓</div>
}

function WorkflowBox({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`mx-auto flex min-h-[74px] w-full max-w-[520px] items-center justify-center rounded-2xl border-2 border-blue-600 bg-white px-6 py-4 text-center text-[17px] leading-7 text-gray-950 shadow-[0_10px_24px_rgba(37,99,235,0.13)] ${className}`}>
      <div>{children}</div>
    </div>
  )
}

function WorkflowSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto my-4 w-fit rounded-full bg-blue-100 px-3.5 py-1.5 text-sm font-bold uppercase tracking-[0.2px] text-blue-800">
      {children}
    </div>
  )
}

function AssignmentRequirementWorkflow() {
  return (
    <section className="overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-slate-50 px-3 py-9 text-gray-950 sm:px-5 print:bg-white">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-11 text-center">
          <h2 className="m-0 text-3xl font-bold tracking-[0.3px] text-blue-900 sm:text-[34px]">
            Assignment Requirement Workflow
          </h2>
          <p className="mt-2.5 text-base text-gray-600">
            Image, Voice Note, and Text-Based Assignment Requirement Processing
          </p>
        </header>

        <div className="flex flex-col items-center">
          <WorkflowBox>
            <strong className="text-blue-800">Assignment Requirement موصول ہوئی؟</strong>
          </WorkflowBox>

          <WorkflowArrow />

          <WorkflowBox>
            <strong className="text-blue-800">Requirement کی form identify کریں</strong>
            <br />
            Image / Voice Note / Text
          </WorkflowBox>

          <WorkflowArrow />

          <div className="mt-2 mb-3 flex w-full flex-col items-center justify-center gap-9 min-[850px]:flex-row min-[850px]:gap-20">
            <div className="flex w-full max-w-[340px] flex-col items-center">
              <div className="mb-4 rounded-full bg-blue-900 px-[18px] py-2.5 text-base font-bold text-white shadow-[0_8px_18px_rgba(30,58,138,0.18)]">
                Image Requirement
              </div>
              <WorkflowBox className="max-w-[310px]">Image کو open کریں</WorkflowBox>
              <WorkflowArrow />
              <WorkflowBox className="max-w-[310px]">Image پر right click کریں</WorkflowBox>
              <WorkflowArrow />
              <WorkflowBox className="max-w-[310px]">Google Lens select کریں</WorkflowBox>
              <WorkflowArrow />
              <WorkflowBox className="max-w-[310px]">
                Text automatically fetch
                <br />
                ہو جائے گا
              </WorkflowBox>
            </div>

            <div className="flex w-full max-w-[340px] flex-col items-center">
              <div className="mb-4 rounded-full bg-blue-900 px-[18px] py-2.5 text-base font-bold text-white shadow-[0_8px_18px_rgba(30,58,138,0.18)]">
                Voice Note Requirement
              </div>
              <WorkflowBox className="max-w-[310px]">Mobile microphone open کریں</WorkflowBox>
              <WorkflowArrow />
              <WorkflowBox className="max-w-[310px]">Google Urdu Typing select کریں</WorkflowBox>
              <WorkflowArrow />
              <WorkflowBox className="max-w-[310px]">Voice note play کریں</WorkflowBox>
              <WorkflowArrow />
              <WorkflowBox className="max-w-[310px]">
                Urdu typing automatically
                <br />
                requirements لکھتی جائے گی
              </WorkflowBox>
            </div>
          </div>

          <div className="relative mt-1 h-[60px] w-full max-w-[520px] max-[849px]:hidden">
            <div className="absolute left-0 top-0 h-[50px] w-1/2 rounded-br-3xl border-b-[3px] border-r-[3px] border-blue-600" />
            <div className="absolute right-0 top-0 h-[50px] w-1/2 rounded-bl-3xl border-b-[3px] border-l-[3px] border-blue-600" />
            <div className="absolute bottom-[-6px] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-blue-600" />
          </div>

          <WorkflowArrow />

          <WorkflowSectionLabel>Requirement Cleaning</WorkflowSectionLabel>
          <WorkflowBox>
            Extracted requirements کو clean کریں
            <br />
            Missing / unclear points mark کریں
          </WorkflowBox>

          <WorkflowArrow />

          <WorkflowSectionLabel>GPT Understanding Stage</WorkflowSectionLabel>
          <WorkflowBox>GPT کو requirements one-by-one دیں</WorkflowBox>

          <WorkflowArrow />

          <WorkflowBox>
            <strong className="text-blue-800">GPT کو instruction دیں:</strong>
            <br />
            صرف understand کرنا ہے
            <br />
            کوئی assumption نہیں بنانی
            <br />
            Urdu کو understand کر کے English میں response دینا ہے
            <br />
            cross-questions پوچھنے ہیں
          </WorkflowBox>

          <WorkflowArrow />

          <WorkflowBox>
            GPT کی understanding verify کریں
            <br />
            کیا اس نے requirement صحیح سمجھی؟
          </WorkflowBox>

          <WorkflowArrow />

          <WorkflowBox className="min-h-[58px] max-w-[160px] border-green-600 bg-green-50 font-bold text-green-800">
            Yes
          </WorkflowBox>

          <WorkflowArrow />

          <WorkflowSectionLabel>Execution Stage</WorkflowSectionLabel>
          <WorkflowBox>
            GPT سے step-by-step execution کروائیں
            <br />
            کوئی step miss نہ ہو
            <br />
            installation/setup بھی شامل ہو
          </WorkflowBox>

          <WorkflowArrow />

          <WorkflowSectionLabel>Final Review</WorkflowSectionLabel>
          <WorkflowBox>
            Final assignment output review کریں
            <br />
            Requirements کے ساتھ match کریں
          </WorkflowBox>
        </div>

        <footer className="mt-9 text-center text-sm text-gray-500">
          Open this file in any browser to preview the workflow.
        </footer>
      </div>
    </section>
  )
}

function PromptShareMenu({
  onShare,
  menuId,
}: {
  onShare: () => void
  menuId: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative" onClick={(event) => event.stopPropagation()}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="More options"
        aria-label="More options"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen(current => !current)}
      >
        <EllipsisVertical className="h-4 w-4" aria-hidden="true" />
      </Button>
      {isOpen && (
        <div
          id={menuId}
          className="absolute right-0 top-9 z-20 w-40 rounded-md border border-gray-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => {
              setIsOpen(false)
              onShare()
            }}
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Share link
          </button>
        </div>
      )}
    </div>
  )
}

export default function PromptsPage() {
  const [page, setPage] = useState(1)
  const { data, loading, error, refresh } = useSupabaseQuery(
    async () => {
      const [courses, promptsPage] = await Promise.all([
        listCourses(),
        listPromptsPage({ page, pageSize: PAGE_SIZE }),
      ])

      return { courses, promptsPage }
    },
    { courses: [], promptsPage: { items: [], total: 0, page: 1, pageSize: PAGE_SIZE } },
    ["courses", "prompts"],
    String(page)
  )
  const { courses, promptsPage } = data
  const prompts = promptsPage.items
  const { addToast } = useToastStore()
  const globalSearchQuery = useSearchStore(state => state.searchQuery)
  const setGlobalSearchQuery = useSearchStore(state => state.setSearchQuery)
  const { isAdmin } = useCurrentUserRole()
  const [initialSharedSubjectPrompt] = useState(() => getSharedSubjectPromptFromUrl())
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectPromptFilter, setSubjectPromptFilter] = useState(initialSharedSubjectPrompt?.category ?? "All")
  const [selectedSubjectPrompt, setSelectedSubjectPrompt] = useState<SubjectWisePrompt | null>(initialSharedSubjectPrompt)
  const [isWritingStyleOpen, setIsWritingStyleOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null)
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(() => getUrlSearchParam("prompt"))
  const [sharedPrompt, setSharedPrompt] = useState<Prompt | null>(null)
  const [deletingPromptId, setDeletingPromptId] = useState<string | null>(null)
  const [form, setForm] = useState<PromptFormState>(EMPTY_PROMPT_FORM)
  const [formError, setFormError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [createdPrompts, setCreatedPrompts] = useState<Prompt[]>([])

  const visiblePrompts = useMemo(() => {
    const existingIds = new Set(prompts.map(prompt => prompt.id))
    return [
      ...createdPrompts.filter(prompt => !existingIds.has(prompt.id)),
      ...prompts,
    ]
  }, [createdPrompts, prompts])

  const filteredPrompts = useMemo(() => {
    const localQuery = searchTerm.trim().toLowerCase()
    const globalQuery = globalSearchQuery.trim().toLowerCase()

    return visiblePrompts
      .filter(prompt => categoryFilter === "All" || prompt.category === categoryFilter)
      .filter(prompt => {
        const relatedCourse = prompt.relatedCourseId
          ? courses.find(item => item.id === prompt.relatedCourseId)
          : undefined
        const courseLabel = relatedCourse ? `${relatedCourse.code} - ${relatedCourse.title}` : "Any course"
        const searchableText = [
          prompt.title,
          prompt.content,
          prompt.category,
          courseLabel,
          ...prompt.tags,
        ].join(" ").toLowerCase()

        return (!localQuery || searchableText.includes(localQuery)) &&
          (!globalQuery || searchableText.includes(globalQuery))
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [categoryFilter, courses, globalSearchQuery, searchTerm, visiblePrompts])

  const filteredSubjectPrompts = useMemo(() => {
    const localQuery = searchTerm.trim().toLowerCase()
    const globalQuery = globalSearchQuery.trim().toLowerCase()

    return subjectWisePrompts
      .filter(prompt => subjectPromptFilter === "All" || prompt.category === subjectPromptFilter)
      .filter(prompt => {
        const searchableText = [
          prompt.title,
          prompt.category,
          prompt.description,
          prompt.content,
          ...prompt.tags,
        ].join(" ").toLowerCase()

        return (!localQuery || searchableText.includes(localQuery)) &&
          (!globalQuery || searchableText.includes(globalQuery))
      })
  }, [globalSearchQuery, searchTerm, subjectPromptFilter])

  const selectedPrompt =
    filteredPrompts.find(p => p.id === selectedPromptId) ??
    (sharedPrompt?.id === selectedPromptId ? sharedPrompt : null) ??
    filteredPrompts[0] ??
    null
  const deletingPrompt = visiblePrompts.find(prompt => prompt.id === deletingPromptId)

  useEffect(() => {
    if (!selectedPromptId) return

    if (visiblePrompts.some(prompt => prompt.id === selectedPromptId) || sharedPrompt?.id === selectedPromptId) {
      return
    }

    let isCancelled = false

    listPromptById(selectedPromptId)
      .then(prompt => {
        if (!isCancelled) setSharedPrompt(prompt)
      })
      .catch(err => {
        if (!isCancelled) {
          addToast({
            title: "Shared prompt not found",
            description: getErrorMessage(err),
            type: "error",
          })
        }
      })

    return () => {
      isCancelled = true
    }
  }, [addToast, selectedPromptId, sharedPrompt?.id, visiblePrompts])

  function updateFormField(field: keyof PromptFormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function resetForm() {
    setForm(EMPTY_PROMPT_FORM)
    setEditingPromptId(null)
    setFormError("")
  }

  function openCreateDialog() {
    resetForm()
    setIsDialogOpen(true)
  }

  function openEditDialog(prompt: Prompt) {
    setForm(toPromptForm(prompt))
    setEditingPromptId(prompt.id)
    setFormError("")
    setIsDialogOpen(true)
  }

  function handleDialogOpenChange(open: boolean) {
    setIsDialogOpen(open)

    if (!open) {
      resetForm()
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError("")
    setIsSaving(true)

    const title = form.title.trim()
    const content = form.content.trim()

    if (!title || !content) {
      setFormError("Title and prompt content are required.")
      setIsSaving(false)
      return
    }

    const promptData = {
      title,
      category: form.category,
      content,
      relatedCourseId: form.relatedCourseId || undefined,
      tags: parseTags(form.tags),
    }

    try {
      if (editingPromptId) {
        const updatedPrompt = await updatePrompt(editingPromptId, promptData)
        setCreatedPrompts(prev => prev.map(prompt => prompt.id === updatedPrompt.id ? updatedPrompt : prompt))
        addToast({
          title: "Prompt Updated",
          description: `${title} was saved.`,
          type: "success",
        })
      } else {
        const createdPrompt = await createPrompt(promptData)
        const savedPrompt = await listPromptById(createdPrompt.id)

        if (!savedPrompt) {
          throw new Error("Prompt was created, but it could not be loaded back from the database.")
        }

        setCreatedPrompts(prev => [
          savedPrompt,
          ...prev.filter(prompt => prompt.id !== savedPrompt.id),
        ])
        setPage(1)
        setCategoryFilter("All")
        setSubjectPromptFilter("All")
        setSearchTerm("")
        setGlobalSearchQuery("")
        setSelectedPromptId(savedPrompt.id)
        addToast({
          title: "Prompt Created",
          description: `${title} was added to the prompt library.`,
          type: "success",
        })
      }

      await refresh()
      setIsDialogOpen(false)
      resetForm()
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCopy(prompt: Prompt) {
    try {
      await navigator.clipboard.writeText(prompt.content)
      addToast({
        title: "Prompt Copied",
        description: `${prompt.title} is ready to paste.`,
        type: "success",
      })
    } catch {
      addToast({
        title: "Copy Failed",
        description: "The browser blocked clipboard access.",
        type: "error",
      })
    }
  }

  async function handleCopySubjectPrompt(prompt: SubjectWisePrompt) {
    try {
      await navigator.clipboard.writeText(prompt.content)
      addToast({
        title: "Prompt copied to clipboard",
        description: `${prompt.title} is ready to paste.`,
        type: "success",
      })
    } catch {
      addToast({
        title: "Copy Failed",
        description: "The browser blocked clipboard access.",
        type: "error",
      })
    }
  }

  async function handleCopyWritingStylePrompt() {
    try {
      await navigator.clipboard.writeText(writingStyleInstruction.promptText)
      addToast({
        title: "Writing style prompt copied to clipboard",
        description: "The writing style prompt is ready to paste.",
        type: "success",
      })
    } catch {
      addToast({
        title: "Copy Failed",
        description: "The browser blocked clipboard access.",
        type: "error",
      })
    }
  }

  async function copyShareLink(url: string, title: string) {
    try {
      await navigator.clipboard.writeText(url)
      addToast({
        title: "Share link copied",
        description: `${title} link is ready to send.`,
        type: "success",
      })
    } catch {
      addToast({
        title: "Share Failed",
        description: "The browser blocked clipboard access.",
        type: "error",
      })
    }
  }

  function buildPromptsUrl(paramName: "prompt" | "subjectPrompt", value: string) {
    const url = new URL("/prompts", window.location.origin)
    url.searchParams.set(paramName, value)
    return url.toString()
  }

  function handleShareSubjectPrompt(prompt: SubjectWisePrompt) {
    const url = buildPromptsUrl("subjectPrompt", getSubjectPromptSlug(prompt))
    void copyShareLink(url, prompt.title)
  }

  function handleSharePrompt(prompt: Prompt) {
    const url = buildPromptsUrl("prompt", prompt.id)
    void copyShareLink(url, prompt.title)
  }

  function openSubjectPromptNew(prompt: SubjectWisePrompt) {
    setForm({
      title: prompt.title,
      category: prompt.category,
      relatedCourseId: "",
      tags: prompt.tags.join(", "),
      content: prompt.content,
    })
    setEditingPromptId(null)
    setFormError("")
    setIsDialogOpen(true)
  }

  async function handleDeletePrompt() {
    if (!deletingPromptId) return

    try {
      await deletePrompt(deletingPromptId)
      await refresh()
      setCreatedPrompts(prev => prev.filter(prompt => prompt.id !== deletingPromptId))
      setDeletingPromptId(null)
      addToast({
        title: "Prompt Deleted",
        description: "The prompt was removed from the library.",
        type: "success",
      })
    } catch (err) {
      addToast({
        title: "Delete Failed",
        description: getErrorMessage(err),
        type: "error",
      })
    }
  }

  function getCourseLabel(courseId?: string) {
    if (!courseId) return "Any course"

    const course = courses.find(item => item.id === courseId)
    return course ? `${course.code} - ${course.title}` : "Any course"
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white font-display text-3xl font-bold tracking-tight">Prompt Library</h1>
          <p className="text-slate-400">Reusable prompt templates for common academic tasks.</p>
        </div>

        {isAdmin && (
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button type="button" className="gap-2" onClick={openCreateDialog}>
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              New Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <form onSubmit={handleSubmit} className="grid gap-5">
              <DialogHeader>
                <DialogTitle>{editingPromptId ? "Edit Prompt" : "Create Prompt"}</DialogTitle>
                <DialogDescription>Save reusable prompt text for common academic work.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="prompt-title">Title</Label>
                  <Input
                    id="prompt-title"
                    value={form.title}
                    onChange={(event) => updateFormField("title", event.target.value)}
                    placeholder="e.g. Presentation Outline Builder"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="prompt-category">Category</Label>
                  <select
                    id="prompt-category"
                    value={form.category}
                    onChange={(event) => updateFormField("category", event.target.value)}
                    className={selectClassName}
                  >
                    {PROMPT_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="prompt-course">Course</Label>
                  <select
                    id="prompt-course"
                    value={form.relatedCourseId}
                    onChange={(event) => updateFormField("relatedCourseId", event.target.value)}
                    className={selectClassName}
                  >
                    <option value="">Any course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="prompt-tags">Tags</Label>
                <Input
                  id="prompt-tags"
                  value={form.tags}
                  onChange={(event) => updateFormField("tags", event.target.value)}
                  placeholder="presentation, assignment, sources"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="prompt-content">Prompt</Label>
                <Textarea
                  id="prompt-content"
                  value={form.content}
                  onChange={(event) => updateFormField("content", event.target.value)}
                  placeholder="Write the reusable prompt here..."
                  className="min-h-[180px]"
                  required
                />
              </div>

              {formError && <p className="text-sm text-red-400">{formError}</p>}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : editingPromptId ? "Save" : "Create"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900/30 to-slate-800/10">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 shadow-sm">
                    <svg className="h-3.5 w-3.5 text-gray-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-medium uppercase tracking-wider">
                    {writingStyleInstruction.section}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-xl">Writing Style Instructions</CardTitle>
                <CardDescription className="mt-1.5 max-w-2xl leading-relaxed text-gray-500 dark:text-slate-400">
                  {writingStyleInstruction.description}
                </CardDescription>
              </div>
              <Button
                type="button"
                variant={isWritingStyleOpen ? "default" : "outline"}
                className={`group shrink-0 gap-2 transition-all sm:mt-0 ${isWritingStyleOpen ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30" : "hover:border-slate-600 hover:bg-gray-100 dark:bg-slate-800"}`}
                aria-expanded={isWritingStyleOpen}
                onClick={() => setIsWritingStyleOpen(current => !current)}
              >
                <span className="text-sm">{writingStyleInstruction.dropdownTitle}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isWritingStyleOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </Button>
            </div>
          </CardHeader>
        </div>
        <div
          className={`grid transition-all duration-300 ease-in-out ${isWritingStyleOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <CardContent className="border-t border-gray-200 dark:border-white/5 bg-white/80 dark:bg-slate-900/20 pb-6 pt-5 sm:pt-6">
              <div className="grid gap-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-[11px] font-bold text-indigo-300">
                        P
                      </div>
                      <h3 className="text-base font-semibold text-slate-100">
                        {writingStyleInstruction.promptTitle}
                      </h3>
                    </div>
                    <p className="mt-1.5 pl-8 text-sm leading-relaxed text-gray-500 dark:text-slate-400">
                      Copy this prompt when you need simple, natural, direct writing instructions.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="default"
                    className="ml-8 gap-2 sm:ml-0"
                    onClick={handleCopyWritingStylePrompt}
                  >
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    Copy Prompt
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-indigo-500/5 to-transparent" />
                  <pre className="relative max-h-[520px] overflow-auto whitespace-pre-wrap rounded-xl border border-gray-300/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 p-5 text-sm leading-7 text-gray-700 dark:text-slate-300 shadow-sm backdrop-blur-sm">
                    {writingStyleInstruction.promptText}
                  </pre>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>

      <Card>
          <CardHeader className="gap-4 border-b border-gray-200 dark:border-white/5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gray-500 dark:text-slate-400" aria-hidden="true" />
                <Badge variant="secondary">Subject-Wise Academic Prompts</Badge>
            </div>
            <CardTitle>Subject-Wise Academic Prompt Library</CardTitle>
            <CardDescription className="mt-2 max-w-3xl leading-6">
              Copy strong reusable planning prompts by assignment type and academic subject before pasting an assignment brief.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-5 sm:pt-6">
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {SUBJECT_PROMPT_FILTERS.map(filter => (
              <Button
                key={filter}
                type="button"
                variant={subjectPromptFilter === filter ? "default" : "outline"}
                size="sm"
                className="shrink-0"
                onClick={() => setSubjectPromptFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>

          {filteredSubjectPrompts.some(isVoiceAndImagePrompt) && (
            <div className="mb-6">
              <AssignmentRequirementWorkflow />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSubjectPrompts.map(prompt => (
              <Card key={prompt.title} className="flex min-h-[320px] flex-col">
                <CardHeader className="gap-3 border-b border-gray-200 dark:border-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <Badge variant="secondary">{prompt.category}</Badge>
                    <div className="flex items-center gap-1">
                      {isAdmin && (
                        <Button type="button" variant="ghost" size="icon" title="Save as new prompt" onClick={() => openSubjectPromptNew(prompt)}>
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Save as new prompt</span>
                        </Button>
                      )}
                      <PromptShareMenu
                        menuId={`subject-prompt-share-${getSubjectPromptSlug(prompt)}`}
                        onShare={() => handleShareSubjectPrompt(prompt)}
                      />
                    </div>
                  </div>
                  <div>
                    <CardTitle>{prompt.title}</CardTitle>
                    <CardDescription className="mt-2 leading-6">{prompt.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-5 pt-5 sm:pt-6">
                  <div className="flex flex-wrap gap-1.5">
                    {prompt.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => handleCopySubjectPrompt(prompt)}>
                      <Copy className="h-4 w-4" aria-hidden="true" />
                      Copy
                    </Button>
                    <Button type="button" className="flex-1 gap-2" onClick={() => setSelectedSubjectPrompt(prompt)}>
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSubjectPrompts.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-slate-700 p-8 text-center text-sm text-gray-400 dark:text-slate-500">
              No subject-wise prompts match this filter.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 dark:text-slate-500" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search prompts..."
                className="h-9 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-gray-100/50 dark:bg-slate-800/50 pl-9 pr-4 text-sm text-slate-200 placeholder:text-gray-400 dark:text-slate-500 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className={`${selectClassName} sm:w-[180px]`}
            >
              <option value="All">All categories</option>
              {PROMPT_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </CardHeader>
          <CardContent className="p-0">
            {loading && <div className="p-6"><LoadingState label="Loading prompts..." /></div>}
            {error && <div className="p-6"><ErrorState message={error} onRetry={refresh} /></div>}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prompt</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrompts.map(prompt => (
                  <TableRow
                    key={prompt.id}
                    className={`cursor-pointer ${selectedPromptId === prompt.id || (!selectedPromptId && filteredPrompts[0]?.id === prompt.id) ? 'bg-indigo-500/5' : ''}`}
                    onClick={() => setSelectedPromptId(prompt.id)}
                  >
                    <TableCell className="max-w-sm">
                      <div className="font-medium text-gray-700 dark:text-slate-300">{prompt.title}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-gray-400 dark:text-slate-500">{prompt.content}</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {prompt.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{prompt.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[190px] truncate text-gray-400 dark:text-slate-500">
                      {getCourseLabel(prompt.relatedCourseId)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-gray-400 dark:text-slate-500">
                      {formatDistanceToNow(new Date(prompt.updatedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button type="button" variant="ghost" size="icon" title="Copy prompt" onClick={() => handleCopy(prompt)}>
                          <Copy className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Copy prompt</span>
                        </Button>
                        <PromptShareMenu
                          menuId={`saved-prompt-share-${prompt.id}`}
                          onShare={() => handleSharePrompt(prompt)}
                        />
                        {isAdmin && (
                          <>
                            <Button type="button" variant="ghost" size="icon" title="Edit prompt" onClick={() => openEditDialog(prompt)}>
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Edit prompt</span>
                            </Button>
                            <Button type="button" variant="ghost" size="icon" title="Delete prompt" onClick={() => setDeletingPromptId(prompt.id)}>
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Delete prompt</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && !error && filteredPrompts.length === 0 && (
                  <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-400 dark:text-slate-500">
                    No prompts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <PaginationControls
              page={promptsPage.page}
              pageSize={promptsPage.pageSize}
              total={promptsPage.total}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>{selectedPrompt ? selectedPrompt.title : "No prompt selected"}</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPrompt ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{selectedPrompt.category}</Badge>
                  <Badge variant="outline">{getCourseLabel(selectedPrompt.relatedCourseId)}</Badge>
                </div>
                <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-md border border-gray-300/50 dark:border-slate-700/50 bg-gray-50 dark:bg-slate-900/50 p-4 text-sm leading-6 text-gray-700 dark:text-slate-300">
                  {selectedPrompt.content}
                </pre>
                <Button type="button" variant="outline" className="w-full gap-2" onClick={() => handleCopy(selectedPrompt)}>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  Copy
                </Button>
                <Button type="button" className="w-full gap-2" onClick={() => handleSharePrompt(selectedPrompt)}>
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  Share Link
                </Button>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-gray-300 dark:border-slate-700 p-6 text-sm text-gray-400 dark:text-slate-500">
                Create a prompt to preview it here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
      <Dialog open={!!deletingPromptId} onOpenChange={(open) => !open && setDeletingPromptId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Prompt</DialogTitle>
            <DialogDescription>
              {deletingPrompt ? `Remove "${deletingPrompt.title}" from the prompt library?` : "Remove this prompt?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeletingPromptId(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeletePrompt}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}

      <Dialog open={!!selectedSubjectPrompt} onOpenChange={(open) => !open && setSelectedSubjectPrompt(null)}>
        <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-5xl">
          {selectedSubjectPrompt && (
            <div className="grid gap-5">
              <DialogHeader>
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">{selectedSubjectPrompt.category}</Badge>
                  {selectedSubjectPrompt.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
                <DialogTitle>{selectedSubjectPrompt.title}</DialogTitle>
                <DialogDescription className="leading-6">{selectedSubjectPrompt.description}</DialogDescription>
              </DialogHeader>

              {isVoiceAndImagePrompt(selectedSubjectPrompt) && <AssignmentRequirementWorkflow />}

              <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-lg border border-gray-300/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 p-4 text-sm leading-6 text-gray-700 dark:text-slate-300">
                {selectedSubjectPrompt.content}
              </pre>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedSubjectPrompt(null)}>
                  Close
                </Button>
                <Button type="button" variant="outline" className="gap-2" onClick={() => handleShareSubjectPrompt(selectedSubjectPrompt)}>
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  Share Link
                </Button>
                <Button type="button" className="gap-2" onClick={() => handleCopySubjectPrompt(selectedSubjectPrompt)}>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  Copy Prompt
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
