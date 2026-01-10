"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/shared/StatusBadge";
import { ShellLayout } from "@/components/layout/ShellLayout";

export default function PhaseDetail() {
    const params = useParams();
    const phaseId = params.id;

    const { data: phase, isLoading } = useQuery({
        queryKey: ["phase", phaseId],
        queryFn: () => api.phases.get(phaseId),
        enabled: !!phaseId,
    });

    const { data: deliverables = [] } = useQuery({
        queryKey: ["phase-deliverables", phaseId],
        queryFn: () => api.deliverables.filter({ phase_id: phaseId }),
        enabled: !!phaseId,
    });

    if (isLoading) {
        return (
            <ShellLayout>
                <div className="max-w-4xl mx-auto space-y-6">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-48" />
                </div>
            </ShellLayout>
        );
    }

    if (!phase) {
        return (
            <ShellLayout>
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardContent className="py-16 text-center">
                            <p className="text-slate-500">Phase not found.</p>
                        </CardContent>
                    </Card>
                </div>
            </ShellLayout>
        );
    }

    return (
        <ShellLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-lg">
                        {phase.order}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{phase.name}</h1>
                        {phase.description && (
                            <p className="text-slate-500">{phase.description}</p>
                        )}
                    </div>
                    <div className="ml-auto">
                        <StatusBadge status={phase.status} />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Deliverables</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {deliverables.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">
                                No deliverables in this phase yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {deliverables
                                    .sort((a, b) => a.order - b.order)
                                    .map((deliverable) => (
                                        <div
                                            key={deliverable.id}
                                            className="flex items-center gap-4 p-3 rounded-xl bg-slate-50"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900">
                                                    {deliverable.name}
                                                </p>
                                                {deliverable.link && (
                                                    <a
                                                        href={deliverable.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-violet-600 hover:underline"
                                                    >
                                                        View {deliverable.link_type}
                                                    </a>
                                                )}
                                            </div>
                                            <StatusBadge status={deliverable.status} />
                                        </div>
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {phase.due_date && (
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-slate-500">Due Date</p>
                            <p className="font-medium">{phase.due_date}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ShellLayout>
    );
}
