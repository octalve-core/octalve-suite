import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        project: true,
        phase: true,
        sender: true,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: message.id,
      project_id: message.projectId,
      phase_id: message.phaseId,
      sender_id: message.senderId,
      sender_name: message.sender?.fullName,
      content: message.content,
      message_type: message.messageType,
      is_resolved: message.isResolved,
      created_date: message.createdAt.toISOString(),
      updated_date: message.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Message GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const data = await request.json();

    const updateData: Record<string, unknown> = {};
    if (data.content !== undefined) updateData.content = data.content;
    if (data.message_type !== undefined)
      updateData.messageType = data.message_type;
    if (data.is_resolved !== undefined)
      updateData.isResolved = data.is_resolved;

    const message = await prisma.message.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      id: message.id,
      project_id: message.projectId,
      phase_id: message.phaseId,
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
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    await prisma.message.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Message DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
