"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  FolderKanban,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Project {
  id: string;
  status: string;
  suite_type: string;
  progress_percentage: number;
}

interface TeamMember {
  id: string;
  is_active: boolean;
}

interface Approval {
  id: string;
  status: string;
}

export default function AnalyticsPage() {
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["all-projects"],
    queryFn: () => api.projects.list(),
  });

  const { data: teamMembers = [], isLoading: loadingTeam } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => api.teamMembers.list(),
  });

  const { data: approvals = [], isLoading: loadingApprovals } = useQuery({
    queryKey: ["all-approvals"],
    queryFn: () => api.approvals.list(),
  });

  const isLoading = loadingProjects || loadingTeam || loadingApprovals;

  // Calculate stats
  const activeProjects = projects.filter(
    (p: Project) => p.status === "active",
  ).length;
  const completedProjects = projects.filter(
    (p: Project) => p.status === "completed",
  ).length;
  const atRiskProjects = projects.filter(
    (p: Project) => p.status === "at_risk",
  ).length;
  const pendingApprovals = approvals.filter(
    (a: Approval) => a.status === "pending",
  ).length;
  const activeTeam = teamMembers.filter((m: TeamMember) => m.is_active).length;

  // Suite type distribution
  const suiteDistribution = projects.reduce(
    (acc: Record<string, number>, p: Project) => {
      acc[p.suite_type] = (acc[p.suite_type] || 0) + 1;
      return acc;
    },
    {},
  );

  // Average progress
  const avgProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce(
            (sum: number, p: Project) => sum + (p.progress_percentage || 0),
            0,
          ) / projects.length,
        )
      : 0;

  const stats = [
    {
      label: "Total Projects",
      value: projects.length,
      icon: FolderKanban,
      color: "violet",
      bgColor: "from-violet-50 to-indigo-50",
      borderColor: "border-violet-100",
    },
    {
      label: "Active Projects",
      value: activeProjects,
      icon: TrendingUp,
      color: "blue",
      bgColor: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-100",
    },
    {
      label: "Completed",
      value: completedProjects,
      icon: CheckCircle2,
      color: "emerald",
      bgColor: "from-emerald-50 to-green-50",
      borderColor: "border-emerald-100",
    },
    {
      label: "At Risk",
      value: atRiskProjects,
      icon: AlertTriangle,
      color: "amber",
      bgColor: "from-amber-50 to-orange-50",
      borderColor: "border-amber-100",
    },
    {
      label: "Pending Approvals",
      value: pendingApprovals,
      icon: Clock,
      color: "rose",
      bgColor: "from-rose-50 to-pink-50",
      borderColor: "border-rose-100",
    },
    {
      label: "Active Team",
      value: activeTeam,
      icon: Users,
      color: "slate",
      bgColor: "from-slate-50 to-gray-50",
      borderColor: "border-slate-200",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1">
          Overview of your projects and team performance
        </p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`bg-gradient-to-br ${stat.bgColor} ${stat.borderColor}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <p className={`text-2xl font-bold text-${stat.color}-900`}>
                    {stat.value}
                  </p>
                  <p className={`text-xs text-${stat.color}-700`}>
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Average Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-slate-200 stroke-current"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  />
                  <circle
                    className="text-violet-600 stroke-current"
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray={`${avgProgress * 2.51327} 251.327`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900">
                    {avgProgress}%
                  </span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-slate-500">
              Average completion across all projects
            </p>
          </CardContent>
        </Card>

        {/* Suite Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5" />
              Project Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(suiteDistribution).map(([type, count]) => {
                const percentage = Math.round(
                  ((count as number) / projects.length) * 100,
                );
                const displayName = type
                  .split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ");
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">
                        {displayName}
                      </span>
                      <span className="text-slate-500">
                        {count as number} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="bg-violet-600 h-2 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
              {Object.keys(suiteDistribution).length === 0 && (
                <p className="text-center text-slate-500 py-8">
                  No project data yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Project Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-2xl font-bold text-blue-900">
                {activeProjects}
              </p>
              <p className="text-sm text-blue-700">Active</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-2xl font-bold text-emerald-900">
                {completedProjects}
              </p>
              <p className="text-sm text-emerald-700">Completed</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-2xl font-bold text-amber-900">
                {atRiskProjects}
              </p>
              <p className="text-sm text-amber-700">At Risk</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-2xl font-bold text-slate-900">
                {projects.filter((p: Project) => p.status === "on_hold").length}
              </p>
              <p className="text-sm text-slate-700">On Hold</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
