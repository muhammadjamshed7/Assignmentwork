import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Layers3,
  ListChecks,
  PenLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyWorkflowButton } from "@/app/workflow/_components/copy-workflow-button"
import {
  getWorkflowCard,
  masterPrompt,
  placeholderGuide,
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

function WorkflowCodeBlock({ text }: { text: string }) {
  return (
    <pre className="overflow-x-auto whitespace-pre rounded-lg border border-gray-300/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 p-4 text-sm leading-6 text-gray-700 dark:text-slate-300">
      {text}
    </pre>
  )
}

function PlaceholderGuide() {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {placeholderGuide.map(item => (
        <div key={item.token} className="rounded-lg border border-gray-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
          <dt className="font-mono text-sm font-semibold text-gray-950 dark:text-slate-100">{item.token}</dt>
          <dd className="mt-1 text-sm leading-6 text-gray-500 dark:text-slate-400">{item.description}</dd>
        </div>
      ))}
    </dl>
  )
}

function WorkflowPhaseMap() {
  const phases = [
    {
      title: "Understand",
      description: "Read the brief, rubric, required format, word count, deadline, and marking criteria.",
      icon: BookOpenCheck,
    },
    {
      title: "Plan",
      description: "Identify subject, academic level, assignment title, structure, and citation expectations.",
      icon: Layers3,
    },
    {
      title: "Draft",
      description: "Create the outline, develop each section, support claims, and keep every paragraph aligned.",
      icon: PenLine,
    },
    {
      title: "Verify",
      description: "Check citations, references, originality, rubric coverage, grammar, formatting, and final files.",
      icon: ClipboardCheck,
    },
  ]

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {phases.map((phase, index) => (
        <div key={phase.title} className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Phase {index + 1}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
              <phase.icon className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <h3 className="mt-4 font-display text-base font-semibold text-gray-950 dark:text-white">{phase.title}</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-slate-400">{phase.description}</p>
        </div>
      ))}
    </div>
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
  return (
    <>
      <ArticleSection eyebrow="Setup" title="Workflow Control Panel">
        <WorkflowOverview category="Academic Steps" steps={workflowSteps.length} checkpoints="4 phases" output="Word ready" />
      </ArticleSection>
      <ArticleSection eyebrow="Execution map" title="Four-Phase Academic Process">
        <WorkflowPhaseMap />
      </ArticleSection>
      <ArticleSection eyebrow="Required inputs" title="Placeholder Guide">
        <PlaceholderGuide />
      </ArticleSection>
      <ArticleSection eyebrow="Reusable prompts" title="Step-By-Step Academic Prompts">
        <div className="grid gap-4">
          {workflowSteps.map(step => (
            <Card key={step.number} className="overflow-hidden">
              <CardHeader className="gap-4 border-b border-gray-200 dark:border-white/5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge variant="secondary">Step {step.number}</Badge>
                  <CardTitle className="mt-3">{step.title}</CardTitle>
                  <CardDescription className="mt-2 leading-6">{step.explanation}</CardDescription>
                </div>
                <CopyWorkflowButton label={step.title} text={step.prompt} />
              </CardHeader>
              <CardContent className="pt-5 sm:pt-6">
                <pre className="whitespace-pre-wrap rounded-lg border border-gray-300/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 p-4 text-sm leading-6 text-gray-700 dark:text-slate-300">
                  {step.prompt}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </ArticleSection>
    </>
  )
}

function MasterPromptArticle() {
  return (
    <>
      <ArticleSection title="Placeholder Explanation">
        <PlaceholderGuide />
      </ArticleSection>
      <ArticleSection title="Ethical Academic Support Note">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-300">
          This prompt is designed for ethical academic support, including planning, outlining, drafting assistance,
          citation checking, editing, and quality review. It must not be used to misrepresent authorship, fabricate
          sources, or bypass academic-integrity requirements.
        </div>
      </ArticleSection>
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
    case "standard-academic-assignment-workflow":
      return <StandardAcademicArticle />
    case "master-assignment-prompt":
      return <MasterPromptArticle />
    default:
      return null
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
  const details = isStandard
    ? [
        "Criteria checked before writing",
        "Reusable step prompts",
        "Citation and reference gate",
        "Final Word-document structure",
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
  const promptItems = workflow.slug === "standard-academic-assignment-workflow"
    ? workflowSteps.length
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
