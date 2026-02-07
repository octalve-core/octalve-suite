"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/shared/StatusBadge";
import SuiteTypeBadge from "@/components/shared/SuiteTypeBadge";
import ProgressRing from "@/components/shared/ProgressRing";

export default function ProjectDetail() {
    const params = useParams();
    const projectId = params.id;

    const { data: project, isLoading } = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => api.projects.get(projectId),
        enabled: !!projectId,
    });

    const { data: phases = [] } = useQuery({
        queryKey: ["project-phases", projectId],
        queryFn: () => api.phases.filter({ project_id: projectId }),
        enabled: !!projectId,
    });

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-48" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="max-w-7xl mx-auto">
                <Card>
                    <CardContent className="py-16 text-center">
                        <p className="text-slate-500">Project not found.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <ProgressRing
                    progress={project.progress_percentage || 0}
                    size={60}
                    strokeWidth={5}
                />
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
                    <p className="text-slate-500">{project.client_name}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <SuiteTypeBadge type={project.suite_type} />
                    <StatusBadge status={project.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Phases</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {phases.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">
                                No phases yet. Add phases to track project progress.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {phases
                                    .sort((a, b) => a.order - b.order)
                                    .map((phase) => (
                                        <div
                                            key={phase.id}
                                            className="flex items-center gap-4 p-3 rounded-xl bg-slate-50"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-medium">
                                                {phase.order}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900">{phase.name}</p>
                                                <p className="text-sm text-slate-500">{phase.description}</p>
                                            </div>
                                            <StatusBadge status={phase.status} />
                                        </div>
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Project Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-slate-500">Client</p>
                            <p className="font-medium">{project.client_name}</p>
                            <p className="text-sm text-slate-500">{project.client_email}</p>
                        </div>
                        {project.target_completion_date && (
                            <div>
                                <p className="text-sm text-slate-500">Target Date</p>
                                <p className="font-medium">{project.target_completion_date}</p>
                            </div>
                        )}
                        {project.project_code && (
                            <div>
                                <p className="text-sm text-slate-500">Project Code</p>
                                <p className="font-medium font-mono">{project.project_code}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
