import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format, differenceInDays, subDays } from "date-fns";
import {
  FolderKanban,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import StatusBadge from "../components/shared/StatusBadge";
import SuiteTypeBadge from "../components/shared/SuiteTypeBadge";

export default function OctalveDashboard() {
  const navigate = useNavigate();

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["all-projects"],
    queryFn: () => base44.entities.Project.list("-created_date"),
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ["all-approvals"],
    queryFn: () => base44.entities.Approval.filter({ status: "pending" }),
  });

  const { data: phases = [] } = useQuery({
    queryKey: ["all-phases"],
    queryFn: () => base44.entities.Phase.list(),
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => base44.entities.TeamMember.list(),
  });

  const activeProjects = projects.filter(
    (p) => p.status === "active" || p.status === "awaiting_approval"
  );
  const atRiskProjects = projects.filter((p) => p.status === "at_risk");
  const completedProjects = projects.filter((p) => p.status === "completed");

  const projectsAwaitingApproval = [
    ...new Set(approvals.map((a) => a.project_id)),
  ].length;

  const overduePhases = phases.filter((p) => {
    if (!p.due_date || p.status === "approved") return false;
    return new Date(p.due_date) < new Date();
  });

  const recentProjects = activeProjects.slice(0, 5);

  const stats = [
    {
      title: "Active Projects",
      value: activeProjects.length,
      icon: FolderKanban,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Awaiting Approval",
      value: projectsAwaitingApproval,
      icon: Clock,
      color: "bg-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "Overdue Phases",
      value: overduePhases.length,
      icon: AlertTriangle,
      color: "bg-rose-500",
      bgColor: "bg-rose-50",
    },
    {
      title: "Completed",
      value: completedProjects.length,
      icon: CheckCircle2,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50",
    },
  ];

  const getSuiteCount = (type) =>
    projects.filter((p) => p.suite_type === type).length;

  if (loadingProjects) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
          <p className="text-slate-500 mt-1">Monitor your projects and team</p>
        </div>
        <Button
          onClick={() => navigate(createPageUrl("CreateProject"))}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                  >
                    <stat.icon
                      className={`w-5 h-5 ${stat.color.replace(
                        "bg-",
                        "text-"
                      )}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Projects</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(createPageUrl("OctalveProjects"))}
                className="text-violet-600"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {recentProjects.length > 0 ? (
                <div className="space-y-3">
                  {recentProjects.map((project) => {
                    const projectPhases = phases.filter(
                      (p) => p.project_id === project.id
                    );
                    const completedPhases = projectPhases.filter(
                      (p) => p.status === "approved"
                    ).length;
                    const hasOverdue = projectPhases.some(
                      (p) =>
                        p.due_date &&
                        new Date(p.due_date) < new Date() &&
                        p.status !== "approved"
                    );

                    return (
                      <div
                        key={project.id}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() =>
                          navigate(
                            createPageUrl("ProjectDetail") + `?id=${project.id}`
                          )
                        }
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900 truncate">
                              {project.name}
                            </h3>
                            {hasOverdue && (
                              <AlertCircle className="w-4 h-4 text-rose-500" />
                            )}
                          </div>
                          <p className="text-sm text-slate-500 truncate">
                            {project.client_name}
                          </p>
                        </div>
                        <SuiteTypeBadge
                          type={project.suite_type}
                          showIcon={false}
                        />
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-medium text-slate-900">
                            {completedPhases}/{projectPhases.length}
                          </p>
                          <p className="text-xs text-slate-500">phases</p>
                        </div>
                        <div className="w-24 hidden md:block">
                          <Progress
                            value={project.progress_percentage || 0}
                            className="h-1.5"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <FolderKanban className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500">No active projects</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate(createPageUrl("CreateProject"))}
                  >
                    Create your first project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Approvals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {approvals.length > 0 ? (
                  <div className="space-y-3">
                    {approvals.slice(0, 4).map((approval) => {
                      const project = projects.find(
                        (p) => p.id === approval.project_id
                      );
                      const phase = phases.find(
                        (p) => p.id === approval.phase_id
                      );
                      const waitingDays = approval.requested_at
                        ? differenceInDays(
                            new Date(),
                            new Date(approval.requested_at)
                          )
                        : 0;

                      return (
                        <div
                          key={approval.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-100"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">
                              {phase?.name || "Unknown Phase"}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {project?.client_name}
                            </p>
                          </div>
                          {waitingDays > 0 && (
                            <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                              {waitingDays}d
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">All caught up!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Projects by Suite */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">By Package</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {["launch", "impact", "growth", "partner"].map((type) => {
                    const count = getSuiteCount(type);
                    const percentage =
                      projects.length > 0
                        ? Math.round((count / projects.length) * 100)
                        : 0;

                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <SuiteTypeBadge type={type} />
                          <span className="text-sm font-medium text-slate-700">
                            {count}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Team Workload (if team members exist) */}
      {teamMembers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Team Workload</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(createPageUrl("OctalveTeam"))}
                className="text-violet-600"
              >
                Manage Team
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {teamMembers.slice(0, 6).map((member) => (
                  <div key={member.id} className="text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mx-auto mb-2">
                      <span className="text-violet-700 font-semibold">
                        {member.name?.charAt(0) || "T"}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {member.role}
                    </p>
                    <p className="text-xs mt-1">
                      <span
                        className={`font-medium ${
                          (member.active_phases_count || 0) > 5
                            ? "text-rose-600"
                            : "text-slate-600"
                        }`}
                      >
                        {member.active_phases_count || 0}
                      </span>
                      <span className="text-slate-400"> phases</span>
                    </p>
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
