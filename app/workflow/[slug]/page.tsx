import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  ListChecks,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyWorkflowButton } from "@/app/workflow/_components/copy-workflow-button"
import {
  getWorkflowCard,
  generalAssignmentWorkflowPrompt,
  masterPrompt,
  specificAssignmentWorkflowPrompt,
  toolsInstallationPrompt,
  unknownAssignmentPrompt,
  workflowCards,
  workflowSteps,
} from "@/app/workflow/workflow-data"

export function generateStaticParams() {
  return workflowCards.map(workflow => ({ slug: workflow.slug }))
}

function ArticleSection({
  children,
  title,
  eyebrow,
}: {
  children: React.ReactNode
  title: string
  eyebrow?: string
}) {
  return (
    <section className="grid gap-4">
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-300">{eyebrow}</p>}
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-gray-950 dark:text-slate-100">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function splitPromptLines(text: string) {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
}

function countNumberedItems(text: string) {
  return splitPromptLines(text).filter(line => /^\d+\./.test(line)).length
}

function WorkflowStat({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-gray-950 dark:text-white">{value}</p>
    </div>
  )
}

function WorkflowOverview({
  category,
  steps,
  checkpoints,
  output,
}: {
  category: string
  steps: number
  checkpoints: string
  output: string
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <WorkflowStat label={category} value={steps} icon={ListChecks} />
      <WorkflowStat label="Quality Gates" value={checkpoints} icon={ShieldCheck} />
      <WorkflowStat label="Final Output" value={output} icon={FileText} />
    </div>
  )
}

function PromptBlock({
  label,
  text,
  description = "Reusable prompt block. Copy it when you need this workflow.",
}: {
  label: string
  text: string
  description?: string
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-4 border-b border-gray-200 dark:border-white/5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>{label}</CardTitle>
          <CardDescription className="mt-2">{description}</CardDescription>
        </div>
        <CopyWorkflowButton label={label} text={text} />
      </CardHeader>
      <CardContent className="pt-5 sm:pt-6">
        <pre className="max-h-[620px] overflow-auto whitespace-pre-wrap rounded-lg border border-gray-300/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 p-4 text-sm leading-6 text-gray-700 dark:text-slate-300">
          {text}
        </pre>
      </CardContent>
    </Card>
  )
}

type StructuredWorkflow = {
  purpose: string
  whenToUse: string[]
  steps: Array<{
    number: number
    title: string
    details: string
  }>
  mandatoryOutputFormat: string[]
  promptBlock: {
    title: string
    subtitle: string
    content: string
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object"
}

function isStructuredWorkflow(value: unknown): value is StructuredWorkflow {
  if (!isRecord(value)) return false

  const promptBlock = value.promptBlock

  return (
    typeof value.purpose === "string" &&
    Array.isArray(value.whenToUse) &&
    value.whenToUse.every(item => typeof item === "string") &&
    Array.isArray(value.steps) &&
    value.steps.every(step =>
      isRecord(step) &&
      typeof step.number === "number" &&
      typeof step.title === "string" &&
      typeof step.details === "string"
    ) &&
    Array.isArray(value.mandatoryOutputFormat) &&
    value.mandatoryOutputFormat.every(item => typeof item === "string") &&
    isRecord(promptBlock) &&
    typeof promptBlock.title === "string" &&
    typeof promptBlock.subtitle === "string" &&
    typeof promptBlock.content === "string"
  )
}

function getStructuredWorkflow(slug: string) {
  const workflow = (workflowSteps as unknown as Record<string, unknown>)[slug]
  return isStructuredWorkflow(workflow) ? workflow : null
}

function StructuredWorkflowArticle({ workflow }: { workflow: StructuredWorkflow }) {
  return (
    <>
      <ArticleSection title="Purpose">
        <p className="leading-7 text-gray-500 dark:text-slate-400">{workflow.purpose}</p>
      </ArticleSection>
      <ArticleSection title="When To Use">
        <ul className="grid gap-2 text-sm leading-6 text-gray-500 dark:text-slate-400">
          {workflow.whenToUse.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </ArticleSection>
      <ArticleSection title={`Full ${workflow.steps.length}-Step Process`}>
        <div className="grid gap-4">
          {workflow.steps.map(step => (
            <Card key={step.number} className="overflow-hidden">
              <CardHeader>
                <Badge variant="secondary">Step {step.number}</Badge>
                <CardTitle className="mt-3">{step.title}</CardTitle>
                <CardDescription className="mt-2 leading-6">{step.details}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ArticleSection>
      <ArticleSection title="Mandatory Output Format">
        <WorkflowCodeBlock text={workflow.mandatoryOutputFormat.map((item, index) => `${index + 1}. ${item}`).join("\n")} />
      </ArticleSection>
      <PromptBlock
        label={workflow.promptBlock.title}
        text={workflow.promptBlock.content}
        description={workflow.promptBlock.subtitle}
      />
    </>
  )
}

function WorkflowCodeBlock({ text }: { text: string }) {
  return (
    <pre className="overflow-x-auto whitespace-pre rounded-lg border border-gray-300/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 p-4 text-sm leading-6 text-gray-700 dark:text-slate-300">
      {text}
    </pre>
  )
}

function UnknownAssignmentArticle() {
  return (
    <>
      <ArticleSection title="Purpose">
        <p className="leading-7 text-gray-500 dark:text-slate-400">
          Use this workflow before starting an unclear, unfamiliar, incomplete, or first-time assignment. It forces
          planning before writing, solving, coding, or preparing the final answer.
        </p>
      </ArticleSection>
      <ArticleSection title="When To Use">
        <ul className="grid gap-2 text-sm leading-6 text-gray-500 dark:text-slate-400">
          <li>When the assignment brief is incomplete or unfamiliar.</li>
          <li>When the subject, tools, outputs, or deliverables are not yet clear.</li>
          <li>When a technical workflow, report structure, or evidence checklist is needed before execution.</li>
        </ul>
      </ArticleSection>
      <ArticleSection title="Full 9-Step Process">
        <WorkflowCodeBlock text={`1. Identify the Subject
2. Ask for or Read the Assignment Brief
3. Break Down the Assignment
4. Identify Required Tools
5. Map Tools to Assignment Tasks
6. Create a Step-by-Step Technical Workflow
7. Prepare the Final Assignment Structure
8. Confirm Final Deliverables
9. Start Assignment Creation Only After Planning`} />
      </ArticleSection>
      <ArticleSection title="Mandatory Output Format">
        <WorkflowCodeBlock text={`1. Assignment Understanding
2. Subject / Domain
3. Complete Task Breakdown
4. Required Tools
5. Tool-to-Task Mapping
6. Step-by-Step Technical Workflow
7. Final Assignment Structure
8. Deliverables Checklist
9. Next Action Plan`} />
      </ArticleSection>
      <PromptBlock label="Unknown Assignment Workflow" text={unknownAssignmentPrompt} />
    </>
  )
}

function ToolsInstallationArticle() {
  return (
    <>
      <ArticleSection title="Purpose">
        <p className="leading-7 text-gray-500 dark:text-slate-400">
          Use this standalone workflow whenever an assignment requires installing, selecting, configuring, or using a
          technical tool, platform, programming environment, notebook, database, cybersecurity tool, or visualization app.
        </p>
      </ArticleSection>
      <ArticleSection title="Core Rule">
        <p className="leading-7 text-gray-500 dark:text-slate-400">
          Do not directly start a tool-based assignment. First create the installation, access, setup, evidence, and
          submission workflow.
        </p>
      </ArticleSection>
      {/* <ArticleSection title="Tool Category Decision Flow">
        <WorkflowCodeBlock text={`Assignment Received
-> Is it Data Analysis?
   -> Use Excel / Power BI / Tableau / R / Python / SPSS
-> Is it Programming?
   -> Use VS Code / Jupyter Notebook / Google Colab / IDE
-> Is it R Language?
   -> Use RStudio / Google Colab / Jupyter Notebook / R Console
-> Is it Python or Notebook Based?
   -> Use Jupyter Notebook / Google Colab / VS Code
-> Is it Cybersecurity?
   -> Use Kali Linux / Wireshark / Nmap / Metasploit
-> Is it Networking?
   -> Use Cisco Packet Tracer / Wireshark / GNS3
-> Is it Database?
   -> Use MySQL / PostgreSQL / MongoDB / Supabase
-> Is it Visualization?
   -> Use Power BI / Tableau / Excel / Python Libraries`} />
      </ArticleSection> */}
      {/* <ArticleSection title="General Arrow-Based Workflow">
        <WorkflowCodeBlock text={`Receive Assignment
-> Identify Assignment Type
-> Identify Required Tool
-> Check Whether Tool Is Local or Online
-> Choose Best Working Option
-> Install / Open / Access Tool
-> Configure Required Settings
-> Upload Dataset or Create Project
-> Run Required Task
-> Check Output
-> Capture Evidence
-> Export Final Files
-> Add Results to Assignment Document
-> Submit Assignment`} />
      </ArticleSection> */}
      <PromptBlock label="Tools Installation Workflow" text={toolsInstallationPrompt} />
    </>
  )
}

function StandardAcademicArticle() {
  const stages = [
    {
      title: "Analyse the Brief",
      description:
        "Identify the assignment type, word count, subject level, referencing style, marking priorities, and formatting rules before planning.",
    },
    {
      title: "Build the Outline",
      description:
        "Create section headings, one-sentence section purposes, word-count allocation, and the sections carrying the highest marks.",
    },
    {
      title: "Write Section by Section",
      description:
        "Write only one approved section at a time, then wait for confirmation before moving to the next section.",
    },
    {
      title: "Review Each Section",
      description:
        "Confirm section word count, marking-criteria coverage, and any missing detail or source needs before continuing.",
    },
  ]

  return (
    <>
      <ArticleSection eyebrow="Setup" title="Workflow Control Panel">
        <WorkflowOverview category="Guided Stages" steps={stages.length} checkpoints="Approval gates" output="Section by section" />
      </ArticleSection>
      <ArticleSection eyebrow="Execution map" title="Brief-To-Completion Process">
        <div className="grid gap-3 md:grid-cols-2">
          {stages.map((stage, index) => (
            <Card key={stage.title} className="overflow-hidden">
              <CardHeader>
                <Badge variant="secondary">Stage {index + 1}</Badge>
                <CardTitle className="mt-3">{stage.title}</CardTitle>
                <CardDescription className="mt-2 leading-6">{stage.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ArticleSection>
      <ArticleSection eyebrow="Control rules" title="Section-By-Section Guardrails">
        <WorkflowCodeBlock text={`1. Analyze the full brief before outlining.
2. Ask for confirmation before building the outline.
3. Wait for outline approval before writing.
4. Write only one section at a time.
5. End each section by asking whether to move to the next section.
6. Do not add the reference list until requested at the end.`} />
      </ArticleSection>
      <ArticleSection eyebrow="Reusable prompt" title="Copy-Ready Workflow Prompt">
        <PromptBlock label="General Assignment Workflow" text={generalAssignmentWorkflowPrompt} />
      </ArticleSection>
    </>
  )
}

function SpecificAssignmentArticle() {
  const structures = [
    {
      type: "Essay",
      structure: "Introduction -> Main Arguments -> Counter-argument -> Conclusion",
    },
    {
      type: "Report",
      structure: "Title Page -> Executive Summary -> Table of Contents -> Introduction -> Findings -> Analysis -> Recommendations -> Conclusion",
    },
    {
      type: "Case Study",
      structure: "Introduction -> Background -> Problem Identification -> Framework Analysis -> Recommendations -> Conclusion",
    },
    {
      type: "Literature Review",
      structure: "Introduction -> Thematic Sections -> Gaps in Literature -> Conclusion",
    },
    {
      type: "Reflective Writing",
      structure: "Description -> Feelings -> Evaluation -> Analysis -> Conclusion -> Action Plan",
    },
    {
      type: "Lab Report",
      structure: "Title -> Abstract -> Introduction -> Method -> Results -> Discussion -> Conclusion -> References",
    },
  ]

  return (
    <>
      <ArticleSection eyebrow="Setup" title="Workflow Control Panel">
        <WorkflowOverview category="Type-Based Stages" steps={5} checkpoints="Structure approval" output="Section by section" />
      </ArticleSection>
      <ArticleSection eyebrow="Structure map" title="Assignment Type Structures">
        <div className="grid gap-3 md:grid-cols-2">
          {structures.map(item => (
            <Card key={item.type} className="overflow-hidden">
              <CardHeader>
                <Badge variant="secondary">{item.type}</Badge>
                <CardDescription className="mt-3 leading-6">{item.structure}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ArticleSection>
      <ArticleSection eyebrow="Workflow stages" title="Type-Based Brief-To-Completion Process">
        <WorkflowCodeBlock text={`1. Identify the assignment type and apply the correct academic structure.
2. Analyze the brief and marking criteria against that structure.
3. Build a detailed section-by-section outline.
4. Wait for outline approval before writing.
5. Write and review one section at a time.`} />
      </ArticleSection>
      <ArticleSection eyebrow="Reusable prompt" title="Copy-Ready Type-Based Workflow Prompt">
        <PromptBlock label="Specific Assignment Workflow" text={specificAssignmentWorkflowPrompt} />
      </ArticleSection>
    </>
  )
}

function MasterPromptArticle() {
  return (
    <>
      {/* <ArticleSection title="Placeholder Explanation">
        <PlaceholderGuide />
      </ArticleSection>
      <ArticleSection title="Ethical Academic Support Note">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-300">
          This prompt is designed for ethical academic support, including planning, outlining, drafting assistance,
          citation checking, editing, and quality review. It must not be used to misrepresent authorship, fabricate
          sources, or bypass academic-integrity requirements.
        </div>
      </ArticleSection> */}
      <PromptBlock label="Master Assignment Prompt" text={masterPrompt} />
    </>
  )
}

function WorkflowArticle({ slug }: { slug: string }) {
  switch (slug) {
    case "unknown-assignment-workflow":
      return <UnknownAssignmentArticle />
    case "tools-installation-workflow":
      return <ToolsInstallationArticle />
    case "specific-assignment-workflow":
      return <SpecificAssignmentArticle />
    case "standard-academic-assignment-workflow":
      return <StandardAcademicArticle />
    case "master-assignment-prompt":
      return <MasterPromptArticle />
    default:
      {
        const structuredWorkflow = getStructuredWorkflow(slug)
        return structuredWorkflow ? <StructuredWorkflowArticle workflow={structuredWorkflow} /> : null
      }
  }
}

function WorkflowSidePanel({
  workflow,
  slug,
  promptItems,
}: {
  workflow: NonNullable<ReturnType<typeof getWorkflowCard>>
  slug: string
  promptItems: number
}) {
  const isStandard = slug === "standard-academic-assignment-workflow"
  const isSpecific = slug === "specific-assignment-workflow"
  const details = isStandard
    ? [
        "Criteria checked before writing",
        "Outline approval gate",
        "One section at a time",
        "Reference list only when requested",
      ]
    : isSpecific
      ? [
        "Assignment type identified first",
        "Correct academic structure applied",
        "Outline approval gate",
        "One section at a time",
      ]
    : [
        "Planning before execution",
        "Tool and deliverable clarity",
        "Evidence checklist",
        "Copy-ready prompt block",
      ]

  return (
    <aside className="grid gap-4 lg:sticky lg:top-24 lg:self-start">
      <Card>
        <CardHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle className="mt-2 text-base">Workflow Summary</CardTitle>
          <CardDescription>{workflow.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.03]">
            <span className="text-gray-500 dark:text-slate-400">Category</span>
            <span className="font-medium text-gray-950 dark:text-white">{workflow.category}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.03]">
            <span className="text-gray-500 dark:text-slate-400">Prompt blocks</span>
            <span className="font-medium text-gray-950 dark:text-white">{promptItems}</span>
          </div>
          <div className="grid gap-2 pt-1">
            {details.map(detail => (
              <div key={detail} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const workflow = getWorkflowCard(slug)

  if (!workflow) {
    notFound()
  }

  const currentIndex = workflowCards.findIndex(card => card.slug === workflow.slug)
  const nextWorkflow = workflowCards[(currentIndex + 1) % workflowCards.length]
  const structuredWorkflow = getStructuredWorkflow(workflow.slug)
  const promptItems = workflow.slug === "standard-academic-assignment-workflow"
    ? 1
    : workflow.slug === "specific-assignment-workflow"
      ? 1
    : structuredWorkflow?.promptBlock
      ? 1
    : workflow.slug === "master-assignment-prompt"
      ? countNumberedItems(masterPrompt)
      : workflow.slug === "tools-installation-workflow"
        ? countNumberedItems(toolsInstallationPrompt)
        : countNumberedItems(unknownAssignmentPrompt)

  return (
    <article className="mx-auto flex max-w-7xl flex-col gap-8">
      <Button asChild variant="ghost" className="w-fit gap-2 px-0 text-gray-700 dark:text-slate-300 hover:bg-transparent hover:text-gray-900 dark:hover:text-white">
        <Link href="/workflow">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Workflows
        </Link>
      </Button>

      <header className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(20,28,46,0.98),rgba(13,20,38,0.96))] sm:p-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400" />
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-16 -translate-y-20 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative max-w-4xl">
          <Badge className="w-fit border border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">{workflow.category}</Badge>
          <h1 className="mt-4 text-gray-950 dark:text-white font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {workflow.title}
          </h1>
          <p className="mt-3 text-lg leading-8 text-gray-600 dark:text-slate-300">{workflow.subtitle}</p>
          <p className="mt-2 max-w-3xl leading-7 text-gray-500 dark:text-slate-400">{workflow.description}</p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-8">
          <WorkflowArticle slug={workflow.slug} />
        </div>
        <WorkflowSidePanel workflow={workflow} slug={workflow.slug} promptItems={promptItems} />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-950 dark:text-slate-100">Next workflow</p>
          <p className="text-sm text-gray-500 dark:text-slate-400">{nextWorkflow.title}</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/workflow/${nextWorkflow.slug}`}>
            Open next
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  )
}
