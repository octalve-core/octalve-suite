import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const teamMembers = await prisma.teamMember.findMany({
            orderBy: { name: "asc" },
        });

        const transformed = teamMembers.map((t) => ({
            id: t.id,
            email: t.email,
            name: t.name,
            role: t.role,
            avatar_url: t.avatarUrl,
            active_phases_count: t.activePhasesCount,
            created_date: t.createdAt.toISOString(),
            updated_date: t.updatedAt.toISOString(),
        }));

        return NextResponse.json(transformed);
    } catch (error) {
        console.error("TeamMembers GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        const teamMember = await prisma.teamMember.create({
            data: {
                email: data.email,
                name: data.name,
                role: data.role,
                avatarUrl: data.avatar_url,
                activePhasesCount: data.active_phases_count || 0,
            },
        });

        return NextResponse.json(
            {
                id: teamMember.id,
                email: teamMember.email,
                name: teamMember.name,
                role: teamMember.role,
                avatar_url: teamMember.avatarUrl,
                active_phases_count: teamMember.activePhasesCount,
                created_date: teamMember.createdAt.toISOString(),
                updated_date: teamMember.updatedAt.toISOString(),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("TeamMembers POST error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
