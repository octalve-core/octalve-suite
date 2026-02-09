"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Lock,
  ChevronRight,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shared/StatusBadge";
import ProjectSelector from "@/components/shared/ProjectSelector";
import { format } from "date-fns";

const dummyUser = {
  email: "roji@octalve.com",
  name: "Roji",
};

interface Phase {
  id: string;
  name: string;
  description?: string;
  status: string;
  order: number;
  due_date?: string;
}

interface Deliverable {
  id: string;
  phase_id: string;
  name: string;
  link?: string;
  link_type?: string;
  status: string;
}

interface Project {
  id: string;
  name: string;
}

export default function PhasesPage() {
  const router = useRouter();
  const [user] = useState(dummyUser);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["client-projects", user?.email],
    queryFn: () => api.projects.filter({ client_email: user?.email }),
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const project =
    projects.find((p: Project) => p.id === selectedProjectId) || projects[0];

  const { data: phases = [], isLoading: loadingPhases } = useQuery({
    queryKey: ["project-phases", project?.id],
    queryFn: () => api.phases.filter({ project_id: project?.id }),
    enabled: !!project?.id,
  });

  const { data: deliverables = [] } = useQuery({
    queryKey: ["project-deliverables", project?.id],
    queryFn: () => api.deliverables.filter({ project_id: project?.id }),
    enabled: !!project?.id,
  });

  const sortedPhases = [...phases].sort(
    (a: Phase, b: Phase) => a.order - b.order,
  );

  const getDeliverablesForPhase = (phaseId: string) => {
    return deliverables.filter((d: Deliverable) => d.phase_id === phaseId);
  };

  const isPhaseAccessible = (phase: Phase, index: number) => {
    if (index === 0) return true;
    const previousPhase = sortedPhases[index - 1];
    return previousPhase && previousPhase.status === "approved";
  };

  const getPhaseIcon = (phase: Phase, isAccessible: boolean) => {
    if (!isAccessible) return <Lock className="w-5 h-5 text-slate-400" />;
    if (phase.status === "approved")
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (
      phase.status === "in_progress" ||
      phase.status === "awaiting_approval"
    ) {
      return <Clock className="w-5 h-5 text-violet-500" />;
    }
    return (
      <span className="text-sm font-medium text-slate-500">{phase.order}</span>
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
          <h1 className="text-2xl font-bold text-slate-900">Project Phases</h1>
          <p className="text-slate-500 mt-1">
            Track progress through each phase of your project
          </p>
        </div>
        {projects.length > 1 && (
          <ProjectSelector
            projects={projects}
            selectedProject={project}
            onSelect={(p: Project) => setSelectedProjectId(p.id)}
          />
        )}
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-violet-700">
                Overall Progress
              </p>
              <p className="text-2xl font-bold text-violet-900">
                {
                  sortedPhases.filter((p: Phase) => p.status === "approved")
                    .length
                }{" "}
                of {sortedPhases.length} phases complete
              </p>
            </div>
            <div className="flex -space-x-1">
              {sortedPhases.slice(0, 5).map((phase: Phase, i: number) => (
                <div
                  key={phase.id}
                  className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium ${
                    phase.status === "approved"
                      ? "bg-emerald-500 text-white"
                      : phase.status === "in_progress" ||
                          phase.status === "awaiting_approval"
                        ? "bg-violet-500 text-white"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {phase.status === "approved" ? "✓" : i + 1}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Phase Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingPhases ? (
            <div className="space-y-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : (
            sortedPhases.map((phase: Phase, index: number) => {
              const isAccessible = isPhaseAccessible(phase, index);
              const phaseDeliverables = getDeliverablesForPhase(phase.id);
              const isExpanded = expandedPhaseId === phase.id;

              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    className={`rounded-xl border transition-all ${
                      !isAccessible
                        ? "opacity-50 bg-slate-50 border-slate-200"
                        : isExpanded
                          ? "border-violet-200 bg-violet-50/50"
                          : "border-slate-200 hover:border-violet-200 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`p-4 flex items-center gap-4 ${
                        isAccessible ? "cursor-pointer" : "cursor-not-allowed"
                      }`}
                      onClick={() =>
                        isAccessible &&
                        setExpandedPhaseId(isExpanded ? null : phase.id)
                      }
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          phase.status === "approved"
                            ? "bg-emerald-100"
                            : phase.status === "in_progress" ||
                                phase.status === "awaiting_approval"
                              ? "bg-violet-100"
                              : "bg-slate-100"
                        }`}
                      >
                        {getPhaseIcon(phase, isAccessible)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {phase.name}
                        </h3>
                        {phase.description && (
                          <p className="text-sm text-slate-500 line-clamp-1">
                            {phase.description}
                          </p>
                        )}
                      </div>
                      {phase.due_date && (
                        <span className="text-sm text-slate-500">
                          Due: {format(new Date(phase.due_date), "MMM d")}
                        </span>
                      )}
                      <StatusBadge status={phase.status} />
                      {isAccessible && (
                        <ChevronRight
                          className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                      )}
                    </div>

                    {isExpanded && isAccessible && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="px-4 pb-4"
                      >
                        <div className="border-t border-slate-200 pt-4 space-y-3">
                          <h4 className="text-sm font-medium text-slate-700">
                            Deliverables ({phaseDeliverables.length})
                          </h4>
                          {phaseDeliverables.length === 0 ? (
                            <p className="text-sm text-slate-500">
                              No deliverables yet
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {phaseDeliverables.map((d: Deliverable) => (
                                <div
                                  key={d.id}
                                  className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-100"
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
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}
                                  <StatusBadge status={d.status} />
                                </div>
                              ))}
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/dashboard/phases/${phase.id}`)
                            }
                            className="mt-2"
                          >
                            View Phase Details
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
