import React from "react"
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer"
import { format } from "date-fns"

import { mapComment, mapIssue, mapStudent } from "@/lib/data/mappers"
import { Comment, Issue, Student } from "@/lib/data/types"
import { createServiceRoleClient, requireApprovedUser } from "@/lib/auth/server"
import { writerStatusFromOverallStatus } from "@/lib/data/writer-status"

export const runtime = "nodejs"

const h = React.createElement

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#18181b",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#71717a",
    marginBottom: 20,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d8",
  },
  profileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  profileItem: {
    width: "48%",
    padding: 8,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 4,
  },
  label: {
    fontSize: 8,
    color: "#71717a",
    marginBottom: 3,
  },
  value: {
    fontSize: 10,
    fontWeight: 700,
  },
  table: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
  },
  tableHeader: {
    backgroundColor: "#f4f4f5",
  },
  tableCell: {
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#e4e4e7",
  },
  tableCellLast: {
    padding: 6,
  },
  headerText: {
    fontSize: 8,
    fontWeight: 700,
    color: "#3f3f46",
  },
  bodyText: {
    fontSize: 8,
    lineHeight: 1.35,
  },
  mutedText: {
    color: "#71717a",
  },
  emptyState: {
    padding: 10,
    color: "#71717a",
  },
  commentCard: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 4,
    marginBottom: 8,
  },
  commentMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 9,
    fontWeight: 700,
  },
  commentDate: {
    fontSize: 8,
    color: "#71717a",
  },
})

function safeDate(value?: string) {
  if (!value) return "Not recorded"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not recorded"

  return format(date, "MMM d, yyyy")
}

function safeDateTime(value?: string) {
  if (!value) return "Not recorded"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not recorded"

  return format(date, "MMM d, yyyy h:mm a")
}

function countBy<T extends string>(items: T[]) {
  return items.reduce((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1
    return acc
  }, {} as Record<T, number>)
}

function profileItem(label: string, value: string) {
  return h(
    View,
    { style: styles.profileItem },
    h(Text, { style: styles.label }, label),
    h(Text, { style: styles.value }, value)
  )
}

function IssueSummaryTable({ issues }: { issues: Issue[] }) {
  const statuses = countBy(issues.map(issue => issue.status))
  const priorities = countBy(issues.map(issue => issue.priority))

  return h(
    View,
    { style: styles.table },
    h(
      View,
      { style: [styles.tableRow, styles.tableHeader] },
      h(View, { style: [styles.tableCell, { width: "25%" }] }, h(Text, { style: styles.headerText }, "Metric")),
      h(View, { style: [styles.tableCell, { width: "25%" }] }, h(Text, { style: styles.headerText }, "Value")),
      h(View, { style: [styles.tableCell, { width: "25%" }] }, h(Text, { style: styles.headerText }, "Metric")),
      h(View, { style: [styles.tableCellLast, { width: "25%" }] }, h(Text, { style: styles.headerText }, "Value"))
    ),
    h(
      View,
      { style: styles.tableRow },
      h(View, { style: [styles.tableCell, { width: "25%" }] }, h(Text, { style: styles.bodyText }, "Total Issues")),
      h(View, { style: [styles.tableCell, { width: "25%" }] }, h(Text, { style: styles.bodyText }, String(issues.length))),
      h(View, { style: [styles.tableCell, { width: "25%" }] }, h(Text, { style: styles.bodyText }, "Open Issues")),
      h(
        View,
        { style: [styles.tableCellLast, { width: "25%" }] },
        h(Text, { style: styles.bodyText }, String(issues.filter(issue => issue.status !== "Resolved").length))
      )
    ),
    h(
      View,
      { style: styles.tableRow },
      h(View, { style: [styles.tableCell, { width: "25%" }] }, h(Text, { style: styles.bodyText }, "Resolved")),
      h(View, { style: [styles.tableCell, { width: "25%" }] }, h(Text, { style: styles.bodyText }, String(statuses.Resolved ?? 0))),
      h(View, { style: [styles.tableCell, { width: "25%" }] }, h(Text, { style: styles.bodyText }, "Escalated")),
      h(View, { style: [styles.tableCellLast, { width: "25%" }] }, h(Text, { style: styles.bodyText }, String(statuses.Escalated ?? 0)))
    ),
    h(
      View,
      { style: styles.tableRow },
      h(View, { style: [styles.tableCell, { width: "25%" }] }, h(Text, { style: styles.bodyText }, "Critical Priority")),
      h(View, { style: [styles.tableCell, { width: "25%" }] }, h(Text, { style: styles.bodyText }, String(priorities.Critical ?? 0))),
      h(View, { style: [styles.tableCell, { width: "25%" }] }, h(Text, { style: styles.bodyText }, "High Priority")),
      h(View, { style: [styles.tableCellLast, { width: "25%" }] }, h(Text, { style: styles.bodyText }, String(priorities.High ?? 0)))
    )
  )
}

function IssueTable({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) {
    return h(View, { style: styles.emptyState }, h(Text, null, "No issues reported."))
  }

  return h(
    View,
    { style: styles.table },
    h(
      View,
      { style: [styles.tableRow, styles.tableHeader] },
      h(View, { style: [styles.tableCell, { width: "22%" }] }, h(Text, { style: styles.headerText }, "Category")),
      h(View, { style: [styles.tableCell, { width: "36%" }] }, h(Text, { style: styles.headerText }, "Description")),
      h(View, { style: [styles.tableCell, { width: "14%" }] }, h(Text, { style: styles.headerText }, "Priority")),
      h(View, { style: [styles.tableCell, { width: "14%" }] }, h(Text, { style: styles.headerText }, "Status")),
      h(View, { style: [styles.tableCellLast, { width: "14%" }] }, h(Text, { style: styles.headerText }, "Reported"))
    ),
    ...issues.map(issue =>
      h(
        View,
        { key: issue.id, style: styles.tableRow, wrap: false },
        h(View, { style: [styles.tableCell, { width: "22%" }] }, h(Text, { style: styles.bodyText }, issue.category)),
        h(View, { style: [styles.tableCell, { width: "36%" }] }, h(Text, { style: styles.bodyText }, issue.description)),
        h(View, { style: [styles.tableCell, { width: "14%" }] }, h(Text, { style: styles.bodyText }, issue.priority)),
        h(View, { style: [styles.tableCell, { width: "14%" }] }, h(Text, { style: styles.bodyText }, issue.status)),
        h(View, { style: [styles.tableCellLast, { width: "14%" }] }, h(Text, { style: styles.bodyText }, safeDate(issue.createdAt)))
      )
    )
  )
}

function CommentHistory({ comments, issues }: { comments: Comment[]; issues: Issue[] }) {
  if (comments.length === 0) {
    return h(View, { style: styles.emptyState }, h(Text, null, "No comments have been recorded."))
  }

  return h(
    View,
    null,
    ...comments.map(comment => {
      const relatedIssue = issues.find(issue => issue.id === comment.issueId)

      return h(
        View,
        { key: comment.id, style: styles.commentCard, wrap: false },
        h(
          View,
          { style: styles.commentMeta },
          h(Text, { style: styles.commentAuthor }, `${comment.authorName} (${comment.role})`),
          h(Text, { style: styles.commentDate }, safeDateTime(comment.createdAt))
        ),
        relatedIssue
          ? h(Text, { style: [styles.bodyText, styles.mutedText] }, `Related issue: ${relatedIssue.category}`)
          : null,
        h(Text, { style: [styles.bodyText, { marginTop: 4 }] }, comment.text)
      )
    })
  )
}

function ReportDocument({
  comments,
  issues,
  student,
}: {
  comments: Comment[]
  issues: Issue[]
  student: Student
}) {
  return h(
    Document,
    {
      title: `${student.name} Report`,
      author: "TDS Management",
      subject: "Writer academic services report",
    },
    h(
      Page,
      { size: "A4", style: styles.page },
      h(Text, { style: styles.title }, "Writer Report"),
      h(Text, { style: styles.subtitle }, `Generated ${format(new Date(), "MMM d, yyyy h:mm a")}`),
      h(
        View,
        { style: styles.section },
        h(Text, { style: styles.sectionTitle }, "Writer Profile"),
        h(
          View,
          { style: styles.profileGrid },
          profileItem("Name", student.name),
          profileItem("Writer ID", student.id),
          profileItem("Email", student.email ?? "Not recorded"),
          profileItem("Assigned Trainer", student.assignedTrainer),
          profileItem("Status", writerStatusFromOverallStatus(student.overallStatus)),
          profileItem("Priority", student.priority),
          profileItem("Assigned Courses", student.assignedCourses.join(", ") || "None"),
          profileItem("Last Update", safeDate(student.lastUpdate))
        )
      ),
      h(
        View,
        { style: styles.section },
        h(Text, { style: styles.sectionTitle }, "Issue Summary"),
        h(IssueSummaryTable, { issues })
      ),
      h(
        View,
        { style: styles.section },
        h(Text, { style: styles.sectionTitle }, "Issue Details"),
        h(IssueTable, { issues })
      ),
      h(
        View,
        { style: styles.section },
        h(Text, { style: styles.sectionTitle }, "Comment History"),
        h(CommentHistory, { comments, issues })
      )
    )
  )
}

function reportFileName(studentName: string) {
  const safeName = studentName.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "writer"
  return `Report-${safeName}.pdf`
}

async function getReportData(studentId: string) {
  const supabase = createServiceRoleClient()

  const [studentResult, issuesResult, commentsResult] = await Promise.all([
    supabase
      .from("students")
      .select(`
        id,
        user_id,
        name,
        email,
        assigned_trainer,
        notes,
        overall_status,
        priority,
        progress,
        last_update,
        student_courses(course:courses(id, code, title))
      `)
      .eq("id", studentId)
      .single(),
    supabase
      .from("issues")
      .select("id, student_id, category, description, status, priority, created_at, updated_at, student:students(id, name)")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false }),
    supabase
      .from("comments")
      .select("id, student_id, issue_id, author_name, role, text, created_at, updated_at")
      .eq("student_id", studentId)
      .order("created_at", { ascending: true }),
  ])

  if (studentResult.error) {
    if (studentResult.status === 406) {
      return null
    }
    throw studentResult.error
  }
  if (issuesResult.error) throw issuesResult.error
  if (commentsResult.error) throw commentsResult.error

  const issues = (issuesResult.data ?? []).map(mapIssue)
  const student = mapStudent(studentResult.data, issues)

  return {
    student,
    studentIssues: issues,
    studentComments: (commentsResult.data ?? []).map(mapComment),
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await context.params
    const profile = await requireApprovedUser()

    if (profile.role === "student" && profile.studentId !== studentId) {
      return Response.json({ error: "You can only access your own report." }, { status: 403 })
    }

    const result = await getReportData(studentId)

    if (!result) {
      return Response.json({ error: "Writer report not found." }, { status: 404 })
    }

    const { student, studentIssues, studentComments } = result
    const pdfDocument = ReportDocument({
      comments: studentComments,
      issues: studentIssues,
      student,
    }) as React.ReactElement<React.ComponentProps<typeof Document>>
    const pdfBuffer = await renderToBuffer(pdfDocument)

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${reportFileName(student.name)}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate report PDF."
    return Response.json({ error: message }, { status: 500 })
  }
}
