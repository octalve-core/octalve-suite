"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  // Phase statuses
  not_started: {
    label: "Not Started",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  awaiting_approval: {
    label: "Awaiting Approval",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  changes_requested: {
    label: "Changes Requested",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },

  // Project statuses
  active: {
    label: "Active",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  at_risk: {
    label: "At Risk",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  archived: {
    label: "Archived",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },

  // Deliverable statuses
  draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  ready_for_review: {
    label: "Ready for Review",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
  updated: {
    label: "Updated",
    className: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },

  // Approval statuses
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

export default function StatusBadge({ status, className }) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-slate-100 text-slate-600",
  };

  return (
    <Badge
      variant="outline"
      className={cn("font-medium border", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
