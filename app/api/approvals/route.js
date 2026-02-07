import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project_id");
    const phaseId = searchParams.get("phase_id");
    const status = searchParams.get("status");

    try {
        const where = {};
        if (projectId) where.projectId = projectId;
        if (phaseId) where.phaseId = phaseId;
        if (status) where.status = status;

        const approvals = await prisma.approval.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                project: true,
                phase: true,
                requestedBy: true,
                respondedBy: true,
            },
        });

        const transformed = approvals.map((a) => ({
            id: a.id,
            project_id: a.projectId,
            phase_id: a.phaseId,
            requested_at: a.requestedAt.toISOString(),
            requested_by: a.requestedBy?.email,
            status: a.status,
            responded_at: a.respondedAt?.toISOString(),
            responded_by: a.respondedBy?.email,
            feedback: a.feedback,
            created_date: a.createdAt.toISOString(),
            updated_date: a.updatedAt.toISOString(),
            // Include related data for convenience
            project_name: a.project?.name,
            phase_name: a.phase?.name,
        }));

        return NextResponse.json(transformed);
    } catch (error) {
        console.error("Approvals GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        const approval = await prisma.approval.create({
            data: {
                projectId: data.project_id,
                phaseId: data.phase_id,
                requestedById: data.requested_by_id,
                status: data.status || "pending",
            },
        });

        return NextResponse.json(
            {
                id: approval.id,
                project_id: approval.projectId,
                phase_id: approval.phaseId,
                requested_at: approval.requestedAt.toISOString(),
                status: approval.status,
                created_date: approval.createdAt.toISOString(),
                updated_date: approval.updatedAt.toISOString(),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Approvals POST error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
