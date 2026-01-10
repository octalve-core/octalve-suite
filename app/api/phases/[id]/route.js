import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const phase = await prisma.phase.findUnique({
            where: { id },
            include: {
                project: true,
                assignedTo: true,
                deliverables: {
                    orderBy: { order: "asc" },
                },
                approvals: {
                    orderBy: { createdAt: "desc" },
                },
                messages: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!phase) {
            return NextResponse.json(
                { error: "Phase not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: phase.id,
            project_id: phase.projectId,
            name: phase.name,
            order: phase.order,
            status: phase.status,
            description: phase.description,
            due_date: phase.dueDate?.toISOString().slice(0, 10),
            approved_at: phase.approvedAt?.toISOString(),
            approved_by: phase.approvedBy,
            assigned_to: phase.assignedTo?.email,
            assigned_to_name: phase.assignedToName || phase.assignedTo?.name,
            created_date: phase.createdAt.toISOString(),
            updated_date: phase.updatedAt.toISOString(),
        });
    } catch (error) {
        console.error("Phase GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    const { id } = await params;

    try {
        const data = await request.json();

        const updateData = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.order !== undefined) updateData.order = data.order;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.due_date !== undefined) {
            updateData.dueDate = data.due_date ? new Date(data.due_date) : null;
        }
        if (data.approved_at !== undefined) {
            updateData.approvedAt = data.approved_at ? new Date(data.approved_at) : null;
        }
        if (data.approved_by !== undefined) updateData.approvedBy = data.approved_by;
        if (data.assigned_to_id !== undefined) updateData.assignedToId = data.assigned_to_id;
        if (data.assigned_to_name !== undefined) updateData.assignedToName = data.assigned_to_name;

        const phase = await prisma.phase.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            id: phase.id,
            project_id: phase.projectId,
            name: phase.name,
            order: phase.order,
            status: phase.status,
            description: phase.description,
            due_date: phase.dueDate?.toISOString().slice(0, 10),
            approved_at: phase.approvedAt?.toISOString(),
            approved_by: phase.approvedBy,
            created_date: phase.createdAt.toISOString(),
            updated_date: phase.updatedAt.toISOString(),
        });
    } catch (error) {
        console.error("Phase PUT error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;

    try {
        await prisma.phase.delete({
            where: { id },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Phase DELETE error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
