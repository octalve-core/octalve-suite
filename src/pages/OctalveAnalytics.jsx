import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Target,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#8B5CF6", "#F59E0B", "#10B981", "#3B82F6"];

export default function OctalveAnalytics() {
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["all-projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: phases = [] } = useQuery({
    queryKey: ["all-phases"],
    queryFn: () => base44.entities.Phase.list(),
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ["all-approvals"],
    queryFn: () => base44.entities.Approval.list(),
  });

  // Calculate metrics
  const activeProjects = projects.filter(
    (p) => p.status === "active" || p.status === "awaiting_approval"
  ).length;
  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  ).length;
  const totalProjects = projects.length;

  // Projects by suite type
  const projectsBySuite = [
    {
      name: "Launch",
      value: projects.filter((p) => p.suite_type === "launch").length,
    },
    {
      name: "Impact",
      value: projects.filter((p) => p.suite_type === "impact").length,
    },
    {
      name: "Growth",
      value: projects.filter((p) => p.suite_type === "growth").length,
    },
    {
      name: "Partner",
      value: projects.filter((p) => p.suite_type === "partner").length,
    },
  ];

  // Phases by status
  const phasesByStatus = [
    {
      name: "Not Started",
      count: phases.filter((p) => p.status === "not_started").length,
    },
    {
      name: "In Progress",
      count: phases.filter((p) => p.status === "in_progress").length,
    },
    {
      name: "Awaiting",
      count: phases.filter((p) => p.status === "awaiting_approval").length,
    },
    {
      name: "Approved",
      count: phases.filter((p) => p.status === "approved").length,
    },
  ];

  // Overdue phases
  const overduePhases = phases.filter(
    (p) =>
      p.due_date && new Date(p.due_date) < new Date() && p.status !== "approved"
  ).length;

  // On-time delivery rate
  const completedPhases = phases.filter((p) => p.status === "approved");
  const onTimePhases = completedPhases.filter((p) => {
    if (!p.due_date || !p.approved_at) return true;
    return new Date(p.approved_at) <= new Date(p.due_date);
  });
  const onTimeRate =
    completedPhases.length > 0
      ? Math.round((onTimePhases.length / completedPhases.length) * 100)
      : 100;

  // Pending approvals
  const pendingApprovals = approvals.filter(
    (a) => a.status === "pending"
  ).length;

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects,
      icon: BarChart3,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
    },
    {
      title: "Active Projects",
      value: activeProjects,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "On-Time Rate",
      value: `${onTimeRate}%`,
      icon: Clock,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Overdue Phases",
      value: overduePhases,
      icon: AlertTriangle,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
    },
  ];

  if (loadingProjects) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1">
          Track your team's performance and project metrics
        </p>
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
            <Card>
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
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects by Suite */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Projects by Package</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectsBySuite}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {projectsBySuite.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Phases by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Phases by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={phasesByStatus} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Delivery Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivery Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    On-Time Delivery
                  </span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {onTimeRate}%
                  </span>
                </div>
                <Progress value={onTimeRate} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Completion Rate
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    {totalProjects > 0
                      ? Math.round((completedProjects / totalProjects) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    totalProjects > 0
                      ? (completedProjects / totalProjects) * 100
                      : 0
                  }
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Pending Approvals
                  </span>
                  <span className="text-sm font-semibold text-amber-600">
                    {pendingApprovals}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {pendingApprovals > 0
                    ? "Requires client action"
                    : "All caught up"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
