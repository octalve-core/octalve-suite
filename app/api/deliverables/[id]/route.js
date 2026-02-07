import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const deliverable = await prisma.deliverable.findUnique({
            where: { id },
        });

        if (!deliverable) {
            return NextResponse.json(
                { error: "Deliverable not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: deliverable.id,
            project_id: deliverable.projectId,
            phase_id: deliverable.phaseId,
            name: deliverable.name,
            link: deliverable.link,
            link_type: deliverable.linkType,
            status: deliverable.status,
            description: deliverable.description,
            order: deliverable.order,
            created_date: deliverable.createdAt.toISOString(),
            updated_date: deliverable.updatedAt.toISOString(),
        });
    } catch (error) {
        console.error("Deliverable GET error:", error);
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
        if (data.link !== undefined) updateData.link = data.link;
        if (data.link_type !== undefined) updateData.linkType = data.link_type;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.order !== undefined) updateData.order = data.order;

        const deliverable = await prisma.deliverable.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
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
        });
    } catch (error) {
        console.error("Deliverable PUT error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;

    try {
        await prisma.deliverable.delete({
            where: { id },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Deliverable DELETE error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
