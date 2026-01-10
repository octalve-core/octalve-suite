import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                assignedPm: true,
                phases: {
                    orderBy: { order: "asc" },
                },
                deliverables: true,
                approvals: true,
                messages: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: project.id,
            name: project.name,
            client_name: project.clientName,
            client_email: project.clientEmail,
            suite_type: project.suiteType,
            status: project.status,
            progress_percentage: project.progressPercentage,
            target_completion_date: project.targetCompletionDate?.toISOString().slice(0, 10),
            internal_notes: project.internalNotes,
            tags: project.tags ? JSON.parse(project.tags) : [],
            project_code: project.projectCode,
            assigned_pm: project.assignedPm?.email,
            created_date: project.createdAt.toISOString(),
            updated_date: project.updatedAt.toISOString(),
        });
    } catch (error) {
        console.error("Project GET error:", error);
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
        if (data.client_name !== undefined) updateData.clientName = data.client_name;
        if (data.client_email !== undefined) updateData.clientEmail = data.client_email;
        if (data.suite_type !== undefined) updateData.suiteType = data.suite_type;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.progress_percentage !== undefined) updateData.progressPercentage = data.progress_percentage;
        if (data.target_completion_date !== undefined) {
            updateData.targetCompletionDate = data.target_completion_date
                ? new Date(data.target_completion_date)
                : null;
        }
        if (data.internal_notes !== undefined) updateData.internalNotes = data.internal_notes;
        if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
        if (data.project_code !== undefined) updateData.projectCode = data.project_code;

        const project = await prisma.project.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            id: project.id,
            name: project.name,
            client_name: project.clientName,
            client_email: project.clientEmail,
            suite_type: project.suiteType,
            status: project.status,
            progress_percentage: project.progressPercentage,
            target_completion_date: project.targetCompletionDate?.toISOString().slice(0, 10),
            project_code: project.projectCode,
            created_date: project.createdAt.toISOString(),
            updated_date: project.updatedAt.toISOString(),
        });
    } catch (error) {
        console.error("Project PUT error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;

    try {
        await prisma.project.delete({
            where: { id },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Project DELETE error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
