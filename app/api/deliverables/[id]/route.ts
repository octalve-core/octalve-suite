import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const deliverable = await prisma.deliverable.findUnique({
      where: { id },
      include: {
        project: true,
        phase: true,
      },
    });

    if (!deliverable) {
      return NextResponse.json(
        { error: "Deliverable not found" },
        { status: 404 },
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
      order: deliverable.order,
      created_date: deliverable.createdAt.toISOString(),
      updated_date: deliverable.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Deliverable GET error:", error);
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
    if (data.name !== undefined) updateData.name = data.name;
    if (data.link !== undefined) updateData.link = data.link;
    if (data.link_type !== undefined) updateData.linkType = data.link_type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.phase_id !== undefined) updateData.phaseId = data.phase_id;

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
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
      { status: 500 },
    );
  }
}
