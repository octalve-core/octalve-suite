import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const teamMember = await prisma.teamMember.findUnique({
            where: { id },
        });

        if (!teamMember) {
            return NextResponse.json(
                { error: "Team member not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: teamMember.id,
            email: teamMember.email,
            name: teamMember.name,
            role: teamMember.role,
            avatar_url: teamMember.avatarUrl,
            active_phases_count: teamMember.activePhasesCount,
            created_date: teamMember.createdAt.toISOString(),
            updated_date: teamMember.updatedAt.toISOString(),
        });
    } catch (error) {
        console.error("TeamMember GET error:", error);
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
        if (data.email !== undefined) updateData.email = data.email;
        if (data.name !== undefined) updateData.name = data.name;
        if (data.role !== undefined) updateData.role = data.role;
        if (data.avatar_url !== undefined) updateData.avatarUrl = data.avatar_url;
        if (data.active_phases_count !== undefined) updateData.activePhasesCount = data.active_phases_count;

        const teamMember = await prisma.teamMember.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            id: teamMember.id,
            email: teamMember.email,
            name: teamMember.name,
            role: teamMember.role,
            avatar_url: teamMember.avatarUrl,
            active_phases_count: teamMember.activePhasesCount,
            created_date: teamMember.createdAt.toISOString(),
            updated_date: teamMember.updatedAt.toISOString(),
        });
    } catch (error) {
        console.error("TeamMember PUT error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;

    try {
        await prisma.teamMember.delete({
            where: { id },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("TeamMember DELETE error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
