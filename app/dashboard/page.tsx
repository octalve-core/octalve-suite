"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Calendar,
  Layers,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ProgressRing from "@/components/shared/ProgressRing";
import StatusBadge from "@/components/shared/StatusBadge";
import ProjectSelector from "@/components/shared/ProjectSelector";
import { format } from "date-fns";

const dummyUser = {
  email: "roji@octalve.com",
  name: "Roji",
};

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(dummyUser);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // useEffect(() => {
  //     api.auth
  //         .me()
  //         .then(setUser)
  //         .catch(() => { });
  // }, []);

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["client-projects", user?.email],
    queryFn: () => api.projects.filter({ client_email: user?.email }),
    enabled: true,
  });

  // Auto-select first project or persisted selection
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

  const { data: phases = [], isLoading: loadingPhases } = useQuery({
    queryKey: ["project-phases", project?.id],
    queryFn: () => api.phases.filter({ project_id: project?.id }),
    enabled: !!project?.id,
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ["pending-approvals", project?.id],
    queryFn: () =>
      api.approvals.filter({
        project_id: project?.id,
        status: "pending",
      }),
    enabled: !!project?.id,
  });

  const { data: deliverables = [] } = useQuery({
    queryKey: ["project-deliverables", project?.id],
    queryFn: () => api.deliverables.filter({ project_id: project?.id }),
    enabled: !!project?.id,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["recent-messages", project?.id],
    queryFn: async () => {
      const msgs = await api.messages.filter({
        project_id: project?.id,
        message_type: "system",
      });
      return msgs.slice(0, 5);
    },
    enabled: !!project?.id,
  });

  const sortedPhases = [...phases].sort((a, b) => a.order - b.order);
  const currentPhase = sortedPhases.find(
    (p) => p.status === "in_progress" || p.status === "awaiting_approval",
  );
  const approvedCount = sortedPhases.filter(
    (p) => p.status === "approved",
  ).length;

  const keyLinks = deliverables
    .filter((d) => d.status === "approved" || d.status === "ready_for_review")
    .slice(0, 4);

  if (loadingProjects) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Active Project
            </h3>
            <p className="text-slate-500">
              You don't have any active projects yet. Contact your PM to get
              started.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <div className="flex items-center gap-3 mt-2">
            <ProjectSelector
              projects={projects}
              selectedProject={project}
              onSelect={handleProjectSelect}
            />
            {projects.length <= 1 && (
              <p className="text-slate-500">{project.name}</p>
            )}
          </div>
        </div>
        {approvals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              onClick={() => router.push("/dashboard/approvals")}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {approvals.length} Pending Approval
              {approvals.length > 1 ? "s" : ""}
            </Button>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 md:p-8 flex-1">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                    Project Progress
                  </h3>
                  <div className="flex items-center gap-6">
                    <ProgressRing
                      progress={project.progress_percentage || 0}
                      size={100}
                      strokeWidth={6}
                      className={""}
                    />
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-sm text-slate-500">Current Phase</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {currentPhase?.name || "All phases complete"}
                        </p>
                      </div>
                      {currentPhase && (
                        <StatusBadge
                          className=""
                          status={currentPhase.status}
                        />
                      )}
                    </div>
                  </div>
                  {project.target_completion_date && (
                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      Target:{" "}
                      {format(
                        new Date(project.target_completion_date),
                        "MMMM d, yyyy",
                      )}
                    </div>
                  )}
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-8 md:w-64 border-t md:border-t-0 md:border-l border-slate-100">
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-violet-700">
                        {approvedCount}
                      </p>
                      <p className="text-sm text-slate-600">
                        of {sortedPhases.length} phases approved
                      </p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-violet-700">
                        {approvals.length}
                      </p>
                      <p className="text-sm text-slate-600">
                        awaiting your action
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                {approvals.length > 0 ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-2">
                Next Action
              </h3>
              <p className="text-lg font-semibold flex-1">
                {approvals.length > 0
                  ? `Review and approve ${
                      currentPhase?.name || "pending phase"
                    }`
                  : "No actions needed right now"}
              </p>
              <Button
                variant="secondary"
                className="mt-4 w-full bg-white text-slate-900 hover:bg-white/90"
                onClick={() => {
                  if (approvals.length > 0) {
                    router.push("/dashboard/approvals");
                  } else {
                    router.push("/dashboard/phases");
                  }
                }}
              >
                {approvals.length > 0 ? "Review Now" : "View Phases"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phase Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Phase Timeline
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/dashboard/phases")}
                  className="text-violet-600 hover:text-violet-700"
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {sortedPhases.slice(0, 5).map((phase, index) => {
                  const previousPhase =
                    index > 0 ? sortedPhases[index - 1] : null;
                  const isLocked =
                    previousPhase &&
                    previousPhase.status !== "approved" &&
                    phase.order > 1;

                  return (
                    <div
                      key={phase.id}
                      className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                        isLocked
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-slate-50 cursor-pointer"
                      }`}
                      onClick={() =>
                        !isLocked &&
                        router.push(`/dashboard/phases/${phase.id}`)
                      }
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${
                          phase.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : phase.status === "in_progress" ||
                                phase.status === "awaiting_approval"
                              ? "bg-violet-100 text-violet-700"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {phase.status === "approved" ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {phase.name}
                        </p>
                      </div>
                      <StatusBadge className="" status={phase.status} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Links Hub */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Key Links</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {keyLinks.length > 0 ? (
                <div className="space-y-2">
                  {keyLinks.map((deliverable) => (
                    <a
                      key={deliverable.id}
                      href={deliverable.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {deliverable.name}
                        </p>
                        <p className="text-sm text-slate-500 truncate">
                          {deliverable.link_type}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">
                    Links will appear here as deliverables are ready
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      {messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50"
                  >
                    <div className="w-2 h-2 rounded-full bg-violet-500 mt-2" />
                    <div className="flex-1">
                      <p className="text-slate-700">{message.content}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {format(
                          new Date(message.created_date),
                          "MMM d, h:mm a",
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
