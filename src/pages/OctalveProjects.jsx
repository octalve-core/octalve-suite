import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Filter,
  FolderKanban,
  MoreVertical,
  Calendar,
  Users,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusBadge from "../components/shared/StatusBadge";
import SuiteTypeBadge from "../components/shared/SuiteTypeBadge";

export default function OctalveProjects() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [suiteFilter, setSuiteFilter] = useState("all");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["all-projects"],
    queryFn: () => base44.entities.Project.list("-created_date"),
  });

  const { data: phases = [] } = useQuery({
    queryKey: ["all-phases"],
    queryFn: () => base44.entities.Phase.list(),
  });

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    const matchesSuite =
      suiteFilter === "all" || project.suite_type === suiteFilter;
    return matchesSearch && matchesStatus && matchesSuite;
  });

  const getProjectPhases = (projectId) =>
    phases.filter((p) => p.project_id === projectId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
        <Button
          onClick={() => navigate(createPageUrl("CreateProject"))}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
            <SelectItem value="at_risk">At Risk</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={suiteFilter} onValueChange={setSuiteFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Package" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Packages</SelectItem>
            <SelectItem value="launch">Launch</SelectItem>
            <SelectItem value="impact">Impact</SelectItem>
            <SelectItem value="growth">Growth</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project, index) => {
            const projectPhases = getProjectPhases(project.id);
            const completedPhases = projectPhases.filter(
              (p) => p.status === "approved"
            ).length;
            const hasOverdue = projectPhases.some(
              (p) =>
                p.due_date &&
                new Date(p.due_date) < new Date() &&
                p.status !== "approved"
            );
            const nextDuePhase = projectPhases
              .filter((p) => p.due_date && p.status !== "approved")
              .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="hover:shadow-md transition-all cursor-pointer group"
                  onClick={() =>
                    navigate(
                      createPageUrl("ProjectDetail") + `?id=${project.id}`
                    )
                  }
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <SuiteTypeBadge type={project.suite_type} />
                        {hasOverdue && (
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                createPageUrl("ProjectDetail") +
                                  `?id=${project.id}`
                              );
                            }}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              // Edit action
                            }}
                          >
                            Edit Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h3 className="font-semibold text-slate-900 mb-1 truncate">
                      {project.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4 truncate">
                      {project.client_name}
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      <StatusBadge status={project.status} />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-medium text-slate-900">
                          {completedPhases}/{projectPhases.length} phases
                        </span>
                      </div>
                      <Progress
                        value={project.progress_percentage || 0}
                        className="h-1.5"
                      />
                    </div>

                    {nextDuePhase && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        Next: {format(new Date(nextDuePhase.due_date), "MMM d")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Projects Found
            </h3>
            <p className="text-slate-500 mb-6">
              {search || statusFilter !== "all" || suiteFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first project to get started"}
            </p>
            {!search && statusFilter === "all" && suiteFilter === "all" && (
              <Button onClick={() => navigate(createPageUrl("CreateProject"))}>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
