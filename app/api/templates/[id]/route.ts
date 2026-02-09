import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    // Parse phases JSON
    let phases = [];
    try {
      phases = template.phases ? JSON.parse(template.phases) : [];
    } catch {
      phases = [];
    }

    return NextResponse.json({
      id: template.id,
      name: template.name,
      suite_type: template.suiteType,
      description: template.description,
      phases,
      is_active: template.isActive,
      created_date: template.createdAt.toISOString(),
      updated_date: template.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Template GET error:", error);
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
    if (data.suite_type !== undefined) updateData.suiteType = data.suite_type;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.phases !== undefined) {
      updateData.phases =
        typeof data.phases === "string"
          ? data.phases
          : JSON.stringify(data.phases);
    }
    if (data.is_active !== undefined) updateData.isActive = data.is_active;

    const template = await prisma.template.update({
      where: { id },
      data: updateData,
    });

    let phases = [];
    try {
      phases = template.phases ? JSON.parse(template.phases) : [];
    } catch {
      phases = [];
    }

    return NextResponse.json({
      id: template.id,
      name: template.name,
      suite_type: template.suiteType,
      description: template.description,
      phases,
      is_active: template.isActive,
      created_date: template.createdAt.toISOString(),
      updated_date: template.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Template PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
      { status: 500 },
    );
  }
}
