"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Layers,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ProgressRing from "@/components/shared/ProgressRing";
import StatusBadge from "@/components/shared/StatusBadge";
import SuiteTypeBadge from "@/components/shared/SuiteTypeBadge";
import ProjectSelector from "@/components/shared/ProjectSelector";
import { format } from "date-fns";

const dummyUser = {
  email: "roji@octalve.com",
  name: "Roji",
};

interface Phase {
  id: string;
  name: string;
  status: string;
  order: number;
}

interface Deliverable {
  id: string;
  name: string;
  link?: string;
  link_type?: string;
  status: string;
}

interface Message {
  id: string;
  content: string;
  created_date: string;
}

interface Project {
  id: string;
  name: string;
  client_name: string;
  client_email: string;
  status: string;
  suite_type: string;
  progress_percentage: number;
  target_completion_date?: string;
  project_code?: string;
}

export default function ProjectPage() {
  const router = useRouter();
  const [user] = useState(dummyUser);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

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

  const project: Project | undefined =
    projects.find((p: Project) => p.id === selectedProjectId) || projects[0];

  const { data: phases = [] } = useQuery({
    queryKey: ["project-phases", project?.id],
    queryFn: () => api.phases.filter({ project_id: project?.id }),
    enabled: !!project?.id,
  });

  const { data: deliverables = [] } = useQuery({
    queryKey: ["project-deliverables", project?.id],
    queryFn: () => api.deliverables.filter({ project_id: project?.id }),
    enabled: !!project?.id,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["project-messages", project?.id],
    queryFn: () => api.messages.filter({ project_id: project?.id }),
    enabled: !!project?.id,
  });

  const sortedPhases = [...phases].sort(
    (a: Phase, b: Phase) => a.order - b.order,
  );
  const currentPhase = sortedPhases.find(
    (p: Phase) =>
      p.status === "in_progress" || p.status === "awaiting_approval",
  );
  const completedPhases = sortedPhases.filter(
    (p: Phase) => p.status === "approved",
  ).length;
  const keyDeliverables = deliverables
    .filter(
      (d: Deliverable) =>
        d.status === "approved" || d.status === "ready_for_review",
    )
    .slice(0, 5);

  if (loadingProjects) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <ProgressRing
            progress={project.progress_percentage || 0}
            size={64}
            strokeWidth={5}
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {project.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <SuiteTypeBadge type={project.suite_type} />
              <StatusBadge status={project.status} />
            </div>
          </div>
        </div>
        {projects.length > 1 && (
          <ProjectSelector
            projects={projects}
            selectedProject={project}
            onSelect={(p: Project) => setSelectedProjectId(p.id)}
          />
        )}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-violet-700">Current Phase</p>
                  <p className="font-semibold text-violet-900">
                    {currentPhase?.name || "Complete"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-emerald-700">Completed</p>
                  <p className="font-semibold text-emerald-900">
                    {completedPhases} / {sortedPhases.length} Phases
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-amber-700">Target Date</p>
                  <p className="font-semibold text-amber-900">
                    {project.target_completion_date
                      ? format(
                          new Date(project.target_completion_date),
                          "MMM d, yyyy",
                        )
                      : "Not set"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-auto p-4 justify-start"
          onClick={() => router.push("/dashboard/phases")}
        >
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mr-4">
            <Layers className="w-5 h-5 text-violet-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">View Phases</p>
            <p className="text-sm text-slate-500">Track progress timeline</p>
          </div>
          <ChevronRight className="w-5 h-5 ml-auto text-slate-400" />
        </Button>

        <Button
          variant="outline"
          className="h-auto p-4 justify-start"
          onClick={() => router.push("/dashboard/approvals")}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mr-4">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">Approvals</p>
            <p className="text-sm text-slate-500">Review pending items</p>
          </div>
          <ChevronRight className="w-5 h-5 ml-auto text-slate-400" />
        </Button>
      </div>

      {/* Key Deliverables */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Key Deliverables</CardTitle>
            <span className="text-sm text-slate-500">
              {deliverables.length} total
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {keyDeliverables.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              Deliverables will appear here as they become available
            </p>
          ) : (
            <div className="space-y-2">
              {keyDeliverables.map((d: Deliverable) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="flex-1 text-sm font-medium text-slate-700">
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
        </CardContent>
      </Card>

      {/* Recent Messages */}
      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Recent Updates
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/support")}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {messages.slice(0, 3).map((msg: Message) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50"
                >
                  <div className="w-2 h-2 rounded-full bg-violet-500 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{msg.content}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {format(new Date(msg.created_date), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Client</p>
            <p className="font-medium">{project.client_name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-medium">{project.client_email}</p>
          </div>
          {project.project_code && (
            <div>
              <p className="text-sm text-slate-500">Project Code</p>
              <p className="font-medium font-mono">{project.project_code}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
