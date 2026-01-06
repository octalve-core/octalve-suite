import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import StatusBadge from "../components/shared/StatusBadge";
import ProjectSelector from "../components/shared/ProjectSelector";

export default function ClientPhases() {
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

  const { data: phases = [], isLoading } = useQuery({
    queryKey: ["project-phases", project?.id],
    queryFn: () => base44.entities.Phase.filter({ project_id: project?.id }),
    enabled: !!project?.id,
  });

  const { data: deliverables = [] } = useQuery({
    queryKey: ["project-deliverables", project?.id],
    queryFn: () =>
      base44.entities.Deliverable.filter({ project_id: project?.id }),
    enabled: !!project?.id,
  });

  const sortedPhases = [...phases].sort((a, b) => a.order - b.order);

  const getPhaseDeliverables = (phaseId) => {
    return deliverables.filter((d) => d.phase_id === phaseId);
  };

  const getPhaseProgress = (phaseId) => {
    const phaseDeliverables = getPhaseDeliverables(phaseId);
    if (phaseDeliverables.length === 0) return 0;
    const completed = phaseDeliverables.filter(
      (d) => d.status === "approved"
    ).length;
    return Math.round((completed / phaseDeliverables.length) * 100);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "awaiting_approval":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  // Check if phase is accessible (previous phase must be approved)
  const isPhaseAccessible = (phase, index) => {
    if (index === 0) return true; // First phase always accessible
    const previousPhase = sortedPhases[index - 1];
    return previousPhase?.status === "approved";
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Project Phases</h1>
        <p className="text-slate-500 mt-1">
          Track your project progress through each phase
        </p>
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

      <div className="space-y-4">
        {sortedPhases.map((phase, index) => {
          const phaseDeliverables = getPhaseDeliverables(phase.id);
          const progress = getPhaseProgress(phase.id);
          const isAccessible = isPhaseAccessible(phase, index);
          const previousPhase = index > 0 ? sortedPhases[index - 1] : null;

          // Locked phase view
          if (!isAccessible) {
            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden opacity-60 bg-slate-50">
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      <div className="w-1.5 bg-slate-200" />
                      <div className="flex-1 p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-500">
                              {phase.name}
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">
                              Complete "{previousPhase?.name}" first to unlock
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md hover:border-violet-200"
                onClick={() =>
                  navigate(createPageUrl("PhaseDetail") + `?id=${phase.id}`)
                }
              >
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    {/* Status indicator bar */}
                    <div
                      className={`w-1.5 
                      ${
                        phase.status === "approved"
                          ? "bg-emerald-500"
                          : phase.status === "awaiting_approval"
                          ? "bg-amber-500"
                          : phase.status === "in_progress"
                          ? "bg-blue-500"
                          : "bg-slate-200"
                      }`}
                    />

                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center
                            ${
                              phase.status === "approved"
                                ? "bg-emerald-50"
                                : phase.status === "awaiting_approval"
                                ? "bg-amber-50"
                                : phase.status === "in_progress"
                                ? "bg-blue-50"
                                : "bg-slate-50"
                            }`}
                          >
                            {getStatusIcon(phase.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {phase.name}
                            </h3>
                            {phase.description && (
                              <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                                {phase.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-3">
                              <StatusBadge status={phase.status} />
                              {phaseDeliverables.length > 0 && (
                                <span className="text-sm text-slate-500">
                                  {
                                    phaseDeliverables.filter(
                                      (d) => d.status === "approved"
                                    ).length
                                  }{" "}
                                  / {phaseDeliverables.length} deliverables
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {phaseDeliverables.length > 0 && (
                            <div className="text-right">
                              <span className="text-sm font-medium text-slate-700">
                                {progress}%
                              </span>
                              <Progress
                                value={progress}
                                className="w-24 h-1.5 mt-1"
                              />
                            </div>
                          )}
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {sortedPhases.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Phases Yet
            </h3>
            <p className="text-slate-500">
              Your project phases will appear here once set up by your PM.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
