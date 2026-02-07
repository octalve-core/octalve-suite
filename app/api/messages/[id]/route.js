import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
    const { id } = await params;

    try {
        const data = await request.json();

        const updateData = {};
        if (data.content !== undefined) updateData.content = data.content;
        if (data.is_resolved !== undefined) updateData.isResolved = data.is_resolved;

        const message = await prisma.message.update({
            where: { id },
            data: updateData,
            include: {
                sender: true,
            },
        });

        return NextResponse.json({
            id: message.id,
            project_id: message.projectId,
            phase_id: message.phaseId,
            sender_email: message.sender?.email,
            sender_name: message.sender?.fullName,
            content: message.content,
            message_type: message.messageType,
            is_resolved: message.isResolved,
            created_date: message.createdAt.toISOString(),
            updated_date: message.updatedAt.toISOString(),
        });
    } catch (error) {
        console.error("Message PUT error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
