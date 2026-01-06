import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Inbox,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectSelector from "../components/shared/ProjectSelector";

export default function ClientApprovals() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    base44.auth
      .me()
      .then(setUser)
      .catch(() => {});
  }, []);

  const { data: projects = [] } = useQuery({
    queryKey: ["client-projects", user?.email],
    queryFn: () =>
      base44.entities.Project.filter({ client_email: user?.email }),
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      const savedId = localStorage.getItem("selectedProjectId");
      const validProject = projects.find((p) => p.id === savedId);
      setSelectedProjectId(validProject?.id || projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const project =
    projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleProjectSelect = (proj) => {
    setSelectedProjectId(proj.id);
    localStorage.setItem("selectedProjectId", proj.id);
  };

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ["project-approvals", project?.id],
    queryFn: () => base44.entities.Approval.filter({ project_id: project?.id }),
    enabled: !!project?.id,
  });

  const { data: phases = [] } = useQuery({
    queryKey: ["project-phases", project?.id],
    queryFn: () => base44.entities.Phase.filter({ project_id: project?.id }),
    enabled: !!project?.id,
  });

  const sortedPhases = [...phases].sort((a, b) => a.order - b.order);

  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const completedApprovals = approvals.filter((a) => a.status !== "pending");

  const getPhase = (phaseId) => phases.find((p) => p.id === phaseId);

  const getWaitingDays = (requestedAt) => {
    if (!requestedAt) return 0;
    return differenceInDays(new Date(), new Date(requestedAt));
  };

  // Check if a phase can be approved (previous phase must be approved)
  const canApprovePhase = (phaseId) => {
    const phase = getPhase(phaseId);
    if (!phase) return false;

    const phaseIndex = sortedPhases.findIndex((p) => p.id === phaseId);
    if (phaseIndex === 0) return true; // First phase can always be approved

    const previousPhase = sortedPhases[phaseIndex - 1];
    return previousPhase?.status === "approved";
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Approvals</h1>
        <p className="text-slate-500 mt-1">Review and approve project phases</p>
        {projects.length > 1 && (
          <div className="mt-4">
            <ProjectSelector
              projects={projects}
              selectedProject={project}
              onSelect={handleProjectSelect}
            />
          </div>
        )}
      </div>

      {/* Pending Approvals */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Pending ({pendingApprovals.length})
        </h2>

        {pendingApprovals.length > 0 ? (
          <div className="space-y-4">
            {pendingApprovals.map((approval, index) => {
              const phase = getPhase(approval.phase_id);
              const waitingDays = getWaitingDays(approval.requested_at);
              const canApprove = canApprovePhase(approval.phase_id);
              const phaseIndex = sortedPhases.findIndex(
                (p) => p.id === approval.phase_id
              );
              const previousPhase =
                phaseIndex > 0 ? sortedPhases[phaseIndex - 1] : null;

              return (
                <motion.div
                  key={approval.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`overflow-hidden hover:shadow-md transition-shadow ${
                      !canApprove ? "border-amber-200 bg-amber-50/30" : ""
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-stretch">
                        <div
                          className={`w-1.5 ${
                            canApprove ? "bg-amber-500" : "bg-slate-300"
                          }`}
                        />
                        <div className="flex-1 p-5">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900">
                                {phase?.name || "Unknown Phase"}
                              </h3>
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className="bg-amber-50 text-amber-700 border-amber-200"
                                >
                                  Awaiting Approval
                                </Badge>
                                <span className="text-sm text-slate-500">
                                  Requested{" "}
                                  {approval.requested_at
                                    ? format(
                                        new Date(approval.requested_at),
                                        "MMM d, yyyy"
                                      )
                                    : "recently"}
                                </span>
                                {waitingDays > 0 && (
                                  <span className="text-sm text-slate-400">
                                    • {waitingDays} day
                                    {waitingDays > 1 ? "s" : ""} waiting
                                  </span>
                                )}
                              </div>
                              {!canApprove && (
                                <div className="flex items-center gap-2 mt-3 text-amber-700 text-sm">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span>
                                    Approve "{previousPhase?.name}" first
                                  </span>
                                </div>
                              )}
                            </div>
                            <Button
                              onClick={() =>
                                navigate(
                                  createPageUrl("PhaseDetail") +
                                    `?id=${approval.phase_id}`
                                )
                              }
                              className={
                                canApprove
                                  ? "bg-violet-600 hover:bg-violet-700"
                                  : ""
                              }
                              variant={canApprove ? "default" : "outline"}
                              disabled={!canApprove}
                            >
                              {canApprove ? (
                                <>
                                  Review & Approve
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4 mr-2" />
                                  Locked
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                All caught up!
              </h3>
              <p className="text-slate-500">
                No pending approvals at the moment.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Approvals */}
      {completedApprovals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Completed ({completedApprovals.length})
          </h2>

          <div className="space-y-3">
            {completedApprovals.map((approval) => {
              const phase = getPhase(approval.phase_id);

              return (
                <Card
                  key={approval.id}
                  className="bg-slate-50 border-slate-200"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900">
                          {phase?.name || "Unknown Phase"}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {approval.status === "approved"
                            ? "Approved"
                            : "Changes requested"}{" "}
                          on{" "}
                          {approval.responded_at
                            ? format(
                                new Date(approval.responded_at),
                                "MMM d, yyyy"
                              )
                            : "N/A"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          approval.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }
                      >
                        {approval.status === "approved"
                          ? "Approved"
                          : "Changes Requested"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {approvals.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Approvals Yet
            </h3>
            <p className="text-slate-500">
              Approval requests will appear here as phases are ready for review.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
