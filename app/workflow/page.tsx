import Link from "next/link"
import { ArrowRight, GraduationCap, HelpCircle, Sparkles, Wrench, type LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { workflowCards } from "@/app/workflow/workflow-data"

const workflowIcons: Record<string, LucideIcon> = {
  "unknown-assignment-workflow": HelpCircle,
  "tools-installation-workflow": Wrench,
  "standard-academic-assignment-workflow": GraduationCap,
  "master-assignment-prompt": Sparkles,
}

export default function WorkflowPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-4xl">
        <Badge variant="secondary">Workflow Library</Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Assignment Workflow
        </h1>
        <p className="mt-2 max-w-3xl text-zinc-500 dark:text-zinc-400">
          Use this workflow system to prepare academic assignments systematically. Select a workflow card below
          to open the full step-by-step guide.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {workflowCards.map(card => {
          const Icon = workflowIcons[card.slug]

          return (
            <Card key={card.slug} className="group flex min-h-[280px] flex-col overflow-hidden">
              <CardHeader className="gap-4 border-b border-zinc-200/70 dark:border-zinc-800/70">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <Badge variant="outline">{card.category}</Badge>
                </div>
                <div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription className="mt-2 leading-6">{card.subtitle}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-6 pt-5 sm:pt-6">
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{card.description}</p>
                <Button asChild variant="outline" className="w-full justify-between gap-2 sm:w-fit">
                  <Link href={`/workflow/${card.slug}`}>
                    {card.buttonText}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
