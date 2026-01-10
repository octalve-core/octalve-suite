import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project_id");
    const phaseId = searchParams.get("phase_id");

    try {
        const where = {};
        if (projectId) where.projectId = projectId;
        if (phaseId) where.phaseId = phaseId;

        const deliverables = await prisma.deliverable.findMany({
            where,
            orderBy: { order: "asc" },
        });

        const transformed = deliverables.map((d) => ({
            id: d.id,
            project_id: d.projectId,
            phase_id: d.phaseId,
            name: d.name,
            link: d.link,
            link_type: d.linkType,
            status: d.status,
            description: d.description,
            order: d.order,
            created_date: d.createdAt.toISOString(),
            updated_date: d.updatedAt.toISOString(),
        }));

        return NextResponse.json(transformed);
    } catch (error) {
        console.error("Deliverables GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        const deliverable = await prisma.deliverable.create({
            data: {
                projectId: data.project_id,
                phaseId: data.phase_id,
                name: data.name,
                link: data.link,
                linkType: data.link_type || "other",
                status: data.status || "draft",
                description: data.description,
                order: data.order || 0,
            },
        });

        return NextResponse.json(
            {
                id: deliverable.id,
                project_id: deliverable.projectId,
                phase_id: deliverable.phaseId,
                name: deliverable.name,
                link: deliverable.link,
                link_type: deliverable.linkType,
                status: deliverable.status,
                order: deliverable.order,
                created_date: deliverable.createdAt.toISOString(),
                updated_date: deliverable.updatedAt.toISOString(),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Deliverables POST error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
