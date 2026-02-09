import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project_id");
    const phaseId = searchParams.get("phase_id");
    const messageType = searchParams.get("message_type");

    try {
        const where = {};
        if (projectId) where.projectId = projectId;
        if (phaseId) where.phaseId = phaseId;
        if (messageType) where.messageType = messageType;

        const messages = await prisma.message.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                sender: true,
            },
        });

        const transformed = messages.map((m) => ({
            id: m.id,
            project_id: m.projectId,
            phase_id: m.phaseId,
            sender_email: m.sender?.email,
            sender_name: m.sender?.fullName,
            content: m.content,
            message_type: m.messageType,
            is_resolved: m.isResolved,
            reply_to_id: m.replyToId,
            created_date: m.createdAt.toISOString(),
            updated_date: m.updatedAt.toISOString(),
        }));

        return NextResponse.json(transformed);
    } catch (error) {
        console.error("Messages GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        const message = await prisma.message.create({
            data: {
                projectId: data.project_id,
                phaseId: data.phase_id,
                senderId: data.sender_id,
                content: data.content,
                messageType: data.message_type || "user",
                isResolved: data.is_resolved || false,
                replyToId: data.reply_to_id,
            },
            include: {
                sender: true,
            },
        });

        return NextResponse.json(
            {
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
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Messages POST error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
