"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  FileText,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/shared/StatusBadge";
import ProjectSelector from "@/components/shared/ProjectSelector";
import { format } from "date-fns";

const dummyUser = {
  email: "roji@octalve.com",
  name: "Roji",
};

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [user] = useState(dummyUser);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [expandedApprovalId, setExpandedApprovalId] = useState<string | null>(
    null,
  );
  const [feedback, setFeedback] = useState("");

  // Fetch projects
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["client-projects", user?.email],
    queryFn: () => api.projects.filter({ client_email: user?.email }),
    enabled: !!user?.email,
  });

  const project =
    projects.find((p: { id: string }) => p.id === selectedProjectId) ||
    projects[0];

  // Fetch approvals for selected project
  const { data: approvals = [], isLoading: loadingApprovals } = useQuery({
    queryKey: ["project-approvals", project?.id],
    queryFn: () => api.approvals.filter({ project_id: project?.id }),
    enabled: !!project?.id,
  });

  // Fetch phases for context
  const { data: phases = [] } = useQuery({
    queryKey: ["project-phases", project?.id],
    queryFn: () => api.phases.filter({ project_id: project?.id }),
    enabled: !!project?.id,
  });

  // Fetch deliverables
  const { data: deliverables = [] } = useQuery({
    queryKey: ["project-deliverables", project?.id],
    queryFn: () => api.deliverables.filter({ project_id: project?.id }),
    enabled: !!project?.id,
  });

  // Update approval mutation
  const updateApproval = useMutation({
    mutationFn: async ({
      id,
      status,
      feedback,
    }: {
      id: string;
      status: string;
      feedback?: string;
    }) => {
      return api.approvals.update(id, {
        status,
        feedback,
        responded_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      setExpandedApprovalId(null);
      setFeedback("");
    },
  });

  const handleApprove = (approvalId: string) => {
    updateApproval.mutate({ id: approvalId, status: "approved" });
  };

  const handleRequestChanges = (approvalId: string) => {
    if (!feedback.trim()) {
      alert("Please provide feedback for the requested changes.");
      return;
    }
    updateApproval.mutate({
      id: approvalId,
      status: "changes_requested",
      feedback,
    });
  };

  const pendingApprovals = approvals.filter(
    (a: { status: string }) => a.status === "pending",
  );
  const resolvedApprovals = approvals.filter(
    (a: { status: string }) => a.status !== "pending",
  );

  const getPhaseForApproval = (phaseId: string) => {
    return phases.find((p: { id: string }) => p.id === phaseId);
  };

  const getDeliverablesForPhase = (phaseId: string) => {
    return deliverables.filter(
      (d: { phase_id: string }) => d.phase_id === phaseId,
    );
  };

  if (loadingProjects) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Active Project
            </h3>
            <p className="text-slate-500">
              You don&apos;t have any active projects yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Approvals</h1>
          <p className="text-slate-500 mt-1">
            Review and approve phase deliverables
          </p>
        </div>
        {projects.length > 1 && (
          <ProjectSelector
            projects={projects}
            selectedProject={project}
            onSelect={(p: { id: string }) => setSelectedProjectId(p.id)}
          />
        )}
      </div>

      {/* Pending Approvals */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-900">
            Pending Review ({pendingApprovals.length})
          </h2>
        </div>

        {loadingApprovals ? (
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : pendingApprovals.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <p className="text-slate-500">
                No pending approvals. You&apos;re all caught up!
              </p>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {pendingApprovals.map(
              (approval: {
                id: string;
                phase_id: string;
                requested_at: string;
              }) => {
                const phase = getPhaseForApproval(approval.phase_id);
                const phaseDeliverables = getDeliverablesForPhase(
                  approval.phase_id,
                );
                const isExpanded = expandedApprovalId === approval.id;

                return (
                  <motion.div
                    key={approval.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="overflow-hidden">
                      <div
                        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() =>
                          setExpandedApprovalId(isExpanded ? null : approval.id)
                        }
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">
                              {phase?.name || "Phase Approval"}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {phaseDeliverables.length} deliverable(s) ready
                              for review
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-amber-200 text-amber-700"
                          >
                            Pending
                          </Badge>
                          <ChevronRight
                            className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          />
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-4">
                              {/* Phase description */}
                              {phase?.description && (
                                <p className="text-slate-600">
                                  {phase.description}
                                </p>
                              )}

                              {/* Deliverables */}
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-slate-700">
                                  Deliverables
                                </h4>
                                {phaseDeliverables.map(
                                  (d: {
                                    id: string;
                                    name: string;
                                    link: string;
                                    link_type: string;
                                    status: string;
                                  }) => (
                                    <div
                                      key={d.id}
                                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
                                    >
                                      <FileText className="w-4 h-4 text-slate-400" />
                                      <span className="flex-1 text-sm text-slate-700">
                                        {d.name}
                                      </span>
                                      {d.link && (
                                        <a
                                          href={d.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-violet-600 hover:text-violet-700"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <ExternalLink className="w-4 h-4" />
                                        </a>
                                      )}
                                      <StatusBadge status={d.status} />
                                    </div>
                                  ),
                                )}
                              </div>

                              {/* Feedback textarea */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4" />
                                  Feedback (optional for approval)
                                </label>
                                <Textarea
                                  placeholder="Enter feedback or change requests..."
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                  rows={3}
                                />
                              </div>

                              {/* Action buttons */}
                              <div className="flex gap-3 pt-2">
                                <Button
                                  onClick={() => handleApprove(approval.id)}
                                  disabled={updateApproval.isPending}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleRequestChanges(approval.id)
                                  }
                                  disabled={updateApproval.isPending}
                                  variant="outline"
                                  className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Request Changes
                                </Button>
                              </div>

                              <p className="text-xs text-slate-400">
                                Requested{" "}
                                {format(
                                  new Date(approval.requested_at),
                                  "MMM d, yyyy 'at' h:mm a",
                                )}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              },
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Resolved Approvals */}
      {resolvedApprovals.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            History ({resolvedApprovals.length})
          </h2>
          <div className="space-y-2">
            {resolvedApprovals
              .slice(0, 5)
              .map(
                (approval: {
                  id: string;
                  phase_id: string;
                  status: string;
                  responded_at: string;
                }) => {
                  const phase = getPhaseForApproval(approval.phase_id);
                  return (
                    <div
                      key={approval.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-slate-50"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          approval.status === "approved"
                            ? "bg-emerald-100"
                            : "bg-amber-100"
                        }`}
                      >
                        {approval.status === "approved" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {phase?.name || "Phase"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {format(
                            new Date(approval.responded_at),
                            "MMM d, yyyy",
                          )}
                        </p>
                      </div>
                      <StatusBadge status={approval.status} />
                    </div>
                  );
                },
              )}
          </div>
        </div>
      )}
    </div>
  );
}
