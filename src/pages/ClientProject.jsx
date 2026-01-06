import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Layers,
  ExternalLink,
  FileText,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProgressRing from "../components/shared/ProgressRing";
import SuiteTypeBadge from "../components/shared/SuiteTypeBadge";
import StatusBadge from "../components/shared/StatusBadge";
import ProjectSelector from "../components/shared/ProjectSelector";

export default function ClientProject() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    base44.auth
      .me()
      .then(setUser)
      .catch(() => {});
  }, []);

  const { data: projects = [], isLoading } = useQuery({
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

  const { data: phases = [] } = useQuery({
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
  const completedPhases = sortedPhases.filter(
    (p) => p.status === "approved"
  ).length;
  const approvedDeliverables = deliverables.filter(
    (d) => d.status === "approved" || d.status === "ready_for_review"
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-48" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Active Project
            </h3>
            <p className="text-slate-500">Contact your PM to get started.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Project Selector for multiple projects */}
      {projects.length > 1 && (
        <div className="mb-4">
          <ProjectSelector
            projects={projects}
            selectedProject={project}
            onSelect={handleProjectSelect}
          />
        </div>
      )}

      {/* Project Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <SuiteTypeBadge
                  type={project.suite_type}
                  className="bg-white/20 border-white/30 text-white mb-4"
                />
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <p className="text-white/80 mt-2">{project.client_name}</p>
              </div>
              <ProgressRing
                progress={project.progress_percentage || 0}
                size={90}
                strokeWidth={6}
                className="[&_span]:text-white [&_.text-slate-900]:text-white [&_.text-slate-500]:text-white/70"
              />
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <StatusBadge status={project.status} className="mt-1" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Phases Completed</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">
                  {completedPhases} / {sortedPhases.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Target Date</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">
                  {project.target_completion_date
                    ? format(
                        new Date(project.target_completion_date),
                        "MMM d, yyyy"
                      )
                    : "TBD"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Deliverables</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">
                  {deliverables.length} items
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(createPageUrl("ClientPhases"))}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">View Phases</h3>
                  <p className="text-sm text-slate-500">
                    {sortedPhases.length} phases total
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(createPageUrl("ClientApprovals"))}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Approvals</h3>
                  <p className="text-sm text-slate-500">Review pending items</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Key Deliverables */}
      {approvedDeliverables.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Deliverables</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {approvedDeliverables.map((deliverable) => (
                  <a
                    key={deliverable.id}
                    href={deliverable.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {deliverable.name}
                      </p>
                      <p className="text-sm text-slate-500 capitalize">
                        {deliverable.link_type}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-violet-600" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
