"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/shared/StatusBadge";
import SuiteTypeBadge from "@/components/shared/SuiteTypeBadge";
import ProgressRing from "@/components/shared/ProgressRing";

export default function OctalveDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        api.auth
            .me()
            .then(setUser)
            .catch(() => { });
    }, []);

    const { data: projects = [], isLoading: loadingProjects } = useQuery({
        queryKey: ["all-projects"],
        queryFn: () => api.projects.list("-created_date"),
    });

    const { data: pendingApprovals = [] } = useQuery({
        queryKey: ["all-pending-approvals"],
        queryFn: () => api.approvals.filter({ status: "pending" }),
    });

    const { data: teamMembers = [] } = useQuery({
        queryKey: ["team-members"],
        queryFn: () => api.teamMembers.list(),
    });

    const activeProjects = projects.filter((p) => p.status === "active");
    const atRiskProjects = projects.filter((p) => p.status === "at_risk");
    const completedProjects = projects.filter((p) => p.status === "completed");

    const stats = [
        {
            label: "Active Projects",
            value: activeProjects.length,
            icon: FolderKanban,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            label: "Pending Approvals",
            value: pendingApprovals.length,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            label: "At Risk",
            value: atRiskProjects.length,
            icon: AlertCircle,
            color: "text-rose-600",
            bg: "bg-rose-50",
        },
        {
            label: "Completed",
            value: completedProjects.length,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
    ];

    if (loadingProjects) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500">
                        Welcome back, {user?.full_name || "Admin"}
                    </p>
                </div>
                <Button
                    onClick={() => router.push("/projects/new")}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
                                    >
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {stat.value}
                                        </p>
                                        <p className="text-sm text-slate-500">{stat.label}</p>
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
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2"
                >
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">
                                    Recent Projects
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push("/projects")}
                                    className="text-violet-600 hover:text-violet-700"
                                >
                                    View All
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                {projects.slice(0, 5).map((project) => (
                                    <div
                                        key={project.id}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                                        onClick={() => router.push(`/projects/${project.id}`)}
                                    >
                                        <ProgressRing
                                            progress={project.progress_percentage || 0}
                                            size={40}
                                            strokeWidth={3}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 truncate">
                                                {project.name}
                                            </p>
                                            <p className="text-sm text-slate-500 truncate">
                                                {project.client_name}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <SuiteTypeBadge type={project.suite_type} />
                                            <StatusBadge status={project.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Team Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">Team</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push("/team")}
                                    className="text-violet-600 hover:text-violet-700"
                                >
                                    Manage
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                {teamMembers.slice(0, 5).map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-3 p-2 rounded-lg"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                                            <span className="text-slate-600 font-medium text-sm">
                                                {member.name?.charAt(0) || "?"}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 truncate text-sm">
                                                {member.name}
                                            </p>
                                            <p className="text-xs text-slate-500 capitalize">
                                                {member.role}
                                            </p>
                                        </div>
                                        <span className="text-xs text-slate-400">
                                            {member.active_phases_count || 0} phases
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
