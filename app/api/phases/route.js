import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project_id");

    try {
        const where = {};
        if (projectId) where.projectId = projectId;

        const phases = await prisma.phase.findMany({
            where,
            orderBy: { order: "asc" },
            include: {
                project: true,
                assignedTo: true,
                deliverables: {
                    orderBy: { order: "asc" },
                },
                _count: {
                    select: { deliverables: true, approvals: true },
                },
            },
        });

        const transformed = phases.map((p) => ({
            id: p.id,
            project_id: p.projectId,
            name: p.name,
            order: p.order,
            status: p.status,
            description: p.description,
            due_date: p.dueDate?.toISOString().slice(0, 10),
            approved_at: p.approvedAt?.toISOString(),
            approved_by: p.approvedBy,
            assigned_to: p.assignedTo?.email,
            assigned_to_name: p.assignedToName || p.assignedTo?.name,
            created_date: p.createdAt.toISOString(),
            updated_date: p.updatedAt.toISOString(),
        }));

        return NextResponse.json(transformed);
    } catch (error) {
        console.error("Phases GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        const phase = await prisma.phase.create({
            data: {
                projectId: data.project_id,
                name: data.name,
                order: data.order || 1,
                status: data.status || "not_started",
                description: data.description,
                dueDate: data.due_date ? new Date(data.due_date) : null,
                assignedToId: data.assigned_to_id,
                assignedToName: data.assigned_to_name,
            },
        });

        return NextResponse.json(
            {
                id: phase.id,
                project_id: phase.projectId,
                name: phase.name,
                order: phase.order,
                status: phase.status,
                description: phase.description,
                due_date: phase.dueDate?.toISOString().slice(0, 10),
                created_date: phase.createdAt.toISOString(),
                updated_date: phase.updatedAt.toISOString(),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Phases POST error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
