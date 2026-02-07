import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const template = await prisma.template.findUnique({
            where: { id },
        });

        if (!template) {
            return NextResponse.json(
                { error: "Template not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: template.id,
            name: template.name,
            suite_type: template.suiteType,
            description: template.description,
            phases: JSON.parse(template.phases),
            created_date: template.createdAt.toISOString(),
            updated_date: template.updatedAt.toISOString(),
        });
    } catch (error) {
        console.error("Template GET error:", error);
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
        if (data.suite_type !== undefined) updateData.suiteType = data.suite_type;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.phases !== undefined) updateData.phases = JSON.stringify(data.phases);

        const template = await prisma.template.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            id: template.id,
            name: template.name,
            suite_type: template.suiteType,
            description: template.description,
            phases: JSON.parse(template.phases),
            created_date: template.createdAt.toISOString(),
            updated_date: template.updatedAt.toISOString(),
        });
    } catch (error) {
        console.error("Template PUT error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;

    try {
        await prisma.template.delete({
            where: { id },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Template DELETE error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
