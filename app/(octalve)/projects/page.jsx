"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/shared/StatusBadge";
import SuiteTypeBadge from "@/components/shared/SuiteTypeBadge";
import ProgressRing from "@/components/shared/ProgressRing";

export default function OctalveProjects() {
    const router = useRouter();

    const { data: projects = [], isLoading } = useQuery({
        queryKey: ["all-projects"],
        queryFn: () => api.projects.list("-created_date"),
    });

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
                <Button
                    onClick={() => router.push("/projects/new")}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                </Button>
            </div>

            {projects.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <FolderKanban className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            No Projects Yet
                        </h3>
                        <p className="text-slate-500 mb-4">
                            Create your first project to get started.
                        </p>
                        <Button onClick={() => router.push("/projects/new")}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Project
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {projects.map((project) => (
                        <Card
                            key={project.id}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/projects/${project.id}`)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <ProgressRing
                                        progress={project.progress_percentage || 0}
                                        size={50}
                                        strokeWidth={4}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900">
                                            {project.name}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            {project.client_name} • {project.client_email}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <SuiteTypeBadge type={project.suite_type} />
                                        <StatusBadge status={project.status} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
