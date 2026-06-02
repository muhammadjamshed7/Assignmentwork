"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToastStore } from "@/store/useToastStore"

export function CopyWorkflowButton({
  label,
  text,
}: {
  label: string
  text: string
}) {
  const [copied, setCopied] = useState(false)
  const { addToast } = useToastStore()

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      addToast({
        title: "Copied to clipboard",
        description: `${label} is ready to paste.`,
        type: "success",
      })
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      addToast({
        title: "Copy Failed",
        description: "The browser blocked clipboard access.",
        type: "error",
      })
    }
  }

  return (
    <Button type="button" variant={copied ? "secondary" : "outline"} size="sm" className="gap-2" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  )
}
