"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToastStore } from "@/store/useToastStore"

const placeholderGuide = [
  {
    token: "[SUBJECT]",
    description:
      "replace with the subject name, for example Cybersecurity, Marketing, Civil Engineering, Business Management, Computer Science, etc.",
  },
  {
    token: "[ASSIGNMENT_TITLE]",
    description: "replace with the exact title of the assignment.",
  },
  {
    token: "[WORD_COUNT]",
    description: "replace with the required word count.",
  },
  {
    token: "[CITATION_STYLE]",
    description:
      "replace with the required referencing style, for example APA 7th, Harvard, MLA, IEEE, or Chicago.",
  },
  {
    token: "[ACADEMIC_LEVEL]",
    description:
      "replace with the level, for example undergraduate, postgraduate, master's, PhD, diploma, or college level.",
  },
]

const workflowSteps = [
  {
    number: 1,
    title: "Read Assignment Criteria",
    explanation:
      "Carefully read the assignment brief, rubric, learning outcomes, formatting requirements, word count, citation style, and submission instructions before writing.",
    prompt:
      "Read the full assignment brief carefully. Identify the marking criteria, learning outcomes, required structure, word count, citation style, formatting rules, and submission requirements. Do not begin writing until all requirements are fully understood.",
  },
  {
    number: 2,
    title: "Identify Subject and Assignment Title",
    explanation:
      "Extract the subject name and assignment title so the academic role and writing approach can be tailored correctly.",
    prompt:
      "Identify the subject area and assignment title from the provided brief. Replace [SUBJECT] with the actual subject, such as Cybersecurity, Marketing, Civil Engineering, Business Management, or Computer Science. Replace [ASSIGNMENT_TITLE] with the exact assignment title.",
  },
  {
    number: 3,
    title: "Expert Academic Role Prompt",
    explanation:
      "Use this prompt to make the assistant behave like a professor-level expert in the selected academic subject.",
    prompt:
      "Act as a professor-level expert in [SUBJECT] with 15+ years of academic, research, and professional experience. Prepare work on [ASSIGNMENT_TITLE] at [ACADEMIC_LEVEL] level using formal academic reasoning, critical analysis, subject-specific terminology, and evidence-based argumentation. Maintain a professional academic tone throughout.",
  },
  {
    number: 4,
    title: "Step-by-Step Assignment Execution",
    explanation:
      "Ensure the work is completed systematically without irrelevant discussion, filler, repetition, or unsupported claims.",
    prompt:
      "Complete this assignment step by step. First analyze the criteria, then create an outline, then develop each section logically. Avoid irrelevant discussion, filler, repetition, unsupported claims, and informal language. Every section must directly support the assignment requirements.",
  },
  {
    number: 5,
    title: "Assignment Outline Generator",
    explanation: "Generate a strong academic structure before drafting the full assignment.",
    prompt:
      "Create a detailed academic outline for [ASSIGNMENT_TITLE] in the subject area of [SUBJECT]. The outline must match the assignment criteria, [WORD_COUNT] word count, [ACADEMIC_LEVEL] level, and [CITATION_STYLE] referencing style. Include an introduction, main body sections, critical analysis points, conclusion, and reference requirements.",
  },
  {
    number: 6,
    title: "Citation and Reference Verification",
    explanation:
      "Check citation consistency, source credibility, and reference-list accuracy before finalizing the assignment.",
    prompt:
      "Check all in-text citations and references carefully. Ensure every in-text citation appears in the reference list, every reference list entry is cited in the text, the required [CITATION_STYLE] style is followed, and no fabricated sources are included. Use only credible, relevant, and academically appropriate sources.",
  },
  {
    number: 7,
    title: "Academic Quality Review",
    explanation:
      "Review the assignment for academic quality, originality, clarity, structure, grammar, and rubric alignment.",
    prompt:
      "Review the assignment for academic quality, originality, coherence, logical flow, grammar, formatting, rubric alignment, citation accuracy, and word count compliance. Improve clarity and academic tone while preserving the meaning and ensuring the work remains ethically prepared and properly referenced.",
  },
  {
    number: 8,
    title: "Final Word Document Preparation",
    explanation:
      "Prepare the final assignment in a clean academic structure suitable for Microsoft Word submission.",
    prompt:
      "Organize the final assignment into a Word-document-ready academic format. Include the title, introduction, main body sections, critical analysis, conclusion, and reference list where required. Ensure the final version is polished, formal, properly referenced, and suitable for academic submission.",
  },
]

const masterPrompt = `You are a professor-level academic expert in [SUBJECT] with 15+ years of academic, research, and professional experience.

Your task is to help prepare an academic assignment titled [ASSIGNMENT_TITLE] at [ACADEMIC_LEVEL] level.

Before writing, carefully read and analyze the assignment brief, rubric, learning outcomes, formatting requirements, word count, citation style, and submission instructions.

Follow this workflow:
1. Identify the assignment criteria.
2. Identify the subject, topic, and academic level.
3. Create a detailed academic outline.
4. Develop the assignment section by section.
5. Use formal academic reasoning and subject-specific terminology.
6. Support claims with credible academic evidence.
7. Use [CITATION_STYLE] referencing correctly.
8. Check that every in-text citation appears in the reference list.
9. Check that every reference list entry is cited in the text.
10. Avoid fabricated sources, unsupported claims, irrelevant discussion, filler, and informal language.
11. Review the final work for academic tone, originality, logical flow, grammar, formatting, rubric alignment, and word count compliance.
12. Prepare the final response in a Word-document-ready academic format.

The final assignment must be clear, structured, evidence-based, properly referenced, academically rigorous, and suitable for submission.`

function getCopyKey(value: number | "master") {
  return typeof value === "number" ? `step-${value}` : value
}

export default function WorkflowPage() {
  const { addToast } = useToastStore()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  async function handleCopy(key: number | "master", text: string, label: string) {
    const copyKey = getCopyKey(key)

    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(copyKey)
      addToast({
        title: "Copied",
        description: `${label} is ready to paste.`,
        type: "success",
      })
      window.setTimeout(() => setCopiedKey(current => (current === copyKey ? null : current)), 2000)
    } catch {
      addToast({
        title: "Copy Failed",
        description: "The browser blocked clipboard access.",
        type: "error",
      })
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Assignment Workflow
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Use this workflow to prepare academic assignments systematically. Students can copy each prompt,
          replace the placeholders with their assignment details, and use the prompts for structured academic support.
        </p>
      </div>

      <Card className="border-zinc-300 dark:border-zinc-700">
        <CardHeader>
          <CardTitle>Placeholder Guide</CardTitle>
          <CardDescription>Replace these placeholders before using the workflow prompts.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            {placeholderGuide.map(item => (
              <div key={item.token} className="rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                <dt className="font-mono text-sm font-semibold text-zinc-950 dark:text-zinc-50">{item.token}</dt>
                <dd className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.description}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <section className="grid gap-4">
        {workflowSteps.map(step => {
          const copyKey = getCopyKey(step.number)
          const isCopied = copiedKey === copyKey

          return (
            <Card key={step.number}>
              <CardHeader className="gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-start sm:justify-between dark:border-zinc-800">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Step {step.number}</Badge>
                    <span className="text-xs font-medium uppercase text-zinc-400">Workflow Prompt</span>
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription className="mt-2 max-w-3xl leading-6">{step.explanation}</CardDescription>
                </div>
                <Button
                  type="button"
                  variant={isCopied ? "secondary" : "outline"}
                  className="shrink-0 gap-2"
                  onClick={() => handleCopy(step.number, step.prompt, step.title)}
                >
                  {isCopied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {isCopied ? "Copied" : "Copy"}
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <pre className="whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200">
                  {step.prompt}
                </pre>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <Card className="border-zinc-300 dark:border-zinc-700">
        <CardHeader className="gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-start sm:justify-between dark:border-zinc-800">
          <div>
            <CardTitle>Master Assignment Prompt</CardTitle>
            <CardDescription className="mt-2">Copy this full prompt when you want the complete workflow in one instruction.</CardDescription>
          </div>
          <Button
            type="button"
            variant={copiedKey === "master" ? "secondary" : "outline"}
            className="shrink-0 gap-2"
            onClick={() => handleCopy("master", masterPrompt, "Master Assignment Prompt")}
          >
            {copiedKey === "master" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copiedKey === "master" ? "Copied" : "Copy"}
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200">
            {masterPrompt}
          </pre>
        </CardContent>
      </Card>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
        This workflow is designed for ethical academic support, including planning, outlining, drafting assistance,
        citation checking, editing, and quality review. It must not be used to misrepresent authorship, fabricate
        sources, or bypass academic-integrity requirements.
      </div>
    </div>
  )
}
