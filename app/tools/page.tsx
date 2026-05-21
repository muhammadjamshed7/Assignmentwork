"use client"

import dynamic from "next/dynamic"
import { useAppStore } from "@/store/useAppStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const AIToolsUsageChart = dynamic(
  () => import("@/components/dashboard/charts").then(mod => mod.AIToolsUsageChart),
  {
    ssr: false,
    loading: ChartPlaceholder,
  }
)

function ChartPlaceholder() {
  return <div className="h-full w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
}

export default function AIToolsPage() {
  const { aiTools } = useAppStore()

  // Sort by usage count
  const sortedTools = [...aiTools].sort((a,b) => b.usageCount - a.usageCount)

  const chartData = sortedTools.map(tool => ({
    name: tool.toolName,
    usage: tool.usageCount,
    problems: tool.relatedProblems
  }))

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">AI Tools Usage Tracker</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Monitor effectiveness and problems associated with various AI generation tools.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage vs Issues Correlation</CardTitle>
          <CardDescription>Visual mapping of total usage versus reported student problems</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <AIToolsUsageChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Tools Detail Directory</CardTitle>
          <CardDescription>Comprehensive metrics for all monitored AI writing tools</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool Name</TableHead>
                <TableHead className="text-right">Total Usage Count</TableHead>
                <TableHead className="text-right">Active Students</TableHead>
                <TableHead className="text-right">Related Problems</TableHead>
                <TableHead className="text-right">Success Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {tool.toolName}
                  </TableCell>
                  <TableCell className="text-right font-medium text-zinc-700 dark:text-zinc-300">
                    {tool.usageCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-zinc-600 dark:text-zinc-400">
                    {tool.activeStudents}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={tool.relatedProblems > 20 ? 'destructive' : tool.relatedProblems > 10 ? 'pending' : 'secondary'}>
                      {tool.relatedProblems} issues
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       <span className="text-sm font-medium">{tool.successRate}%</span>
                       <div className="h-2 w-16 bg-zinc-100 rounded-full dark:bg-zinc-800 overflow-hidden">
                         <div 
                           className={`h-full ${tool.successRate > 80 ? 'bg-emerald-500' : tool.successRate > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                           style={{ width: `${tool.successRate}%` }}
                         />
                       </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
