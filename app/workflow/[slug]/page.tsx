import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

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
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{title}</h2>
      {children}
    </section>
  )
}

function PromptBlock({
  label,
  text,
}: {
  label: string
  text: string
}) {
  return (
    <Card>
      <CardHeader className="gap-4 border-b border-zinc-200/70 sm:flex-row sm:items-start sm:justify-between dark:border-zinc-800/70">
        <div>
          <CardTitle>{label}</CardTitle>
          <CardDescription className="mt-2">Reusable prompt block. Copy it when you need this workflow.</CardDescription>
        </div>
        <CopyWorkflowButton label={label} text={text} />
      </CardHeader>
      <CardContent className="pt-5 sm:pt-6">
        <pre className="max-h-[620px] overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200">
          {text}
        </pre>
      </CardContent>
    </Card>
  )
}

function WorkflowCodeBlock({ text }: { text: string }) {
  return (
    <pre className="overflow-x-auto whitespace-pre rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200">
      {text}
    </pre>
  )
}

function PlaceholderGuide() {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {placeholderGuide.map(item => (
        <div key={item.token} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <dt className="font-mono text-sm font-semibold text-zinc-950 dark:text-zinc-50">{item.token}</dt>
          <dd className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.description}</dd>
        </div>
      ))}
    </dl>
  )
}

function UnknownAssignmentArticle() {
  return (
    <>
      <ArticleSection title="Purpose">
        <p className="leading-7 text-zinc-600 dark:text-zinc-400">
          Use this workflow before starting an unclear, unfamiliar, incomplete, or first-time assignment. It forces
          planning before writing, solving, coding, or preparing the final answer.
        </p>
      </ArticleSection>
      <ArticleSection title="When To Use">
        <ul className="grid gap-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
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
        <p className="leading-7 text-zinc-600 dark:text-zinc-400">
          Use this standalone workflow whenever an assignment requires installing, selecting, configuring, or using a
          technical tool, platform, programming environment, notebook, database, cybersecurity tool, or visualization app.
        </p>
      </ArticleSection>
      <ArticleSection title="Core Rule">
        <p className="leading-7 text-zinc-600 dark:text-zinc-400">
          Do not directly start a tool-based assignment. First create the installation, access, setup, evidence, and
          submission workflow.
        </p>
      </ArticleSection>
      <ArticleSection title="Tool Category Decision Flow">
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
      </ArticleSection>
      <ArticleSection title="General Arrow-Based Workflow">
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
      </ArticleSection>
      <PromptBlock label="Tools Installation Workflow" text={toolsInstallationPrompt} />
    </>
  )
}

function StandardAcademicArticle() {
  return (
    <>
      <ArticleSection title="Placeholder Guide">
        <PlaceholderGuide />
      </ArticleSection>
      <ArticleSection title="Step-By-Step Academic Prompts">
        <div className="grid gap-4">
          {workflowSteps.map(step => (
            <Card key={step.number}>
              <CardHeader className="gap-4 border-b border-zinc-200/70 sm:flex-row sm:items-start sm:justify-between dark:border-zinc-800/70">
                <div>
                  <Badge variant="secondary">Step {step.number}</Badge>
                  <CardTitle className="mt-3">{step.title}</CardTitle>
                  <CardDescription className="mt-2 leading-6">{step.explanation}</CardDescription>
                </div>
                <CopyWorkflowButton label={step.title} text={step.prompt} />
              </CardHeader>
              <CardContent className="pt-5 sm:pt-6">
                <pre className="whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200">
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
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
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

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const workflow = getWorkflowCard(slug)

  if (!workflow) notFound()

  const currentIndex = workflowCards.findIndex(card => card.slug === workflow.slug)
  const nextWorkflow = workflowCards[(currentIndex + 1) % workflowCards.length]

  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-8">
      <Button asChild variant="ghost" className="w-fit gap-2 px-0 hover:bg-transparent">
        <Link href="/workflow">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Workflows
        </Link>
      </Button>

      <header className="grid gap-4">
        <Badge variant="secondary" className="w-fit">{workflow.category}</Badge>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
            {workflow.title}
          </h1>
          <p className="mt-3 text-lg leading-8 text-zinc-600 dark:text-zinc-400">{workflow.subtitle}</p>
          <p className="mt-2 leading-7 text-zinc-500 dark:text-zinc-500">{workflow.description}</p>
        </div>
      </header>

      <div className="grid gap-8">
        <WorkflowArticle slug={workflow.slug} />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Next workflow</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{nextWorkflow.title}</p>
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
