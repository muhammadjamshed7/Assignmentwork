import type { IssueStatus } from "@/lib/data/types";

export type WriterStatus = "Active" | "Inactive";

export function writerStatusFromOverallStatus(status: IssueStatus): WriterStatus {
  return status === "In Progress" ? "Active" : "Inactive";
}

export function writerStatusBadgeVariant(status: WriterStatus) {
  return status === "Active" ? "success" : "pending";
}
