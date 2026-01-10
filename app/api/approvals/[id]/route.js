import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const approval = await prisma.approval.findUnique({
            where: { id },
            include: {
                project: true,
                phase: true,
                requestedBy: true,
                respondedBy: true,
            },
        });

        if (!approval) {
            return NextResponse.json(
                { error: "Approval not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: approval.id,
            project_id: approval.projectId,
            phase_id: approval.phaseId,
            requested_at: approval.requestedAt.toISOString(),
            requested_by: approval.requestedBy?.email,
            status: approval.status,
            responded_at: approval.respondedAt?.toISOString(),
            responded_by: approval.respondedBy?.email,
            feedback: approval.feedback,
            created_date: approval.createdAt.toISOString(),
            updated_date: approval.updatedAt.toISOString(),
        });
    } catch (error) {
        console.error("Approval GET error:", error);
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
        if (data.status !== undefined) updateData.status = data.status;
        if (data.responded_at !== undefined) {
            updateData.respondedAt = data.responded_at ? new Date(data.responded_at) : new Date();
        }
        if (data.responded_by_id !== undefined) updateData.respondedById = data.responded_by_id;
        if (data.feedback !== undefined) updateData.feedback = data.feedback;

        const approval = await prisma.approval.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            id: approval.id,
            project_id: approval.projectId,
            phase_id: approval.phaseId,
            status: approval.status,
            responded_at: approval.respondedAt?.toISOString(),
            feedback: approval.feedback,
            created_date: approval.createdAt.toISOString(),
            updated_date: approval.updatedAt.toISOString(),
        });
    } catch (error) {
        console.error("Approval PUT error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;

    try {
        await prisma.approval.delete({
            where: { id },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Approval DELETE error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
