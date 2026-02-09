import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const teamMember = await prisma.teamMember.findUnique({
      where: { id },
      include: {
        user: true,
        assignedProjects: true,
        activePhases: true,
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: teamMember.id,
      user_id: teamMember.userId,
      name: teamMember.name,
      email: teamMember.email,
      role: teamMember.role,
      avatar: teamMember.avatar,
      phone: teamMember.phone,
      department: teamMember.department,
      is_active: teamMember.isActive,
      assigned_projects: teamMember.assignedProjects.map((p) => p.id),
      active_phases: teamMember.activePhases.map((p) => p.id),
      created_date: teamMember.createdAt.toISOString(),
      updated_date: teamMember.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("TeamMember GET error:", error);
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
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.is_active !== undefined) updateData.isActive = data.is_active;

    const teamMember = await prisma.teamMember.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      id: teamMember.id,
      name: teamMember.name,
      email: teamMember.email,
      role: teamMember.role,
      avatar: teamMember.avatar,
      phone: teamMember.phone,
      department: teamMember.department,
      is_active: teamMember.isActive,
      created_date: teamMember.createdAt.toISOString(),
      updated_date: teamMember.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("TeamMember PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
      { status: 500 },
    );
  }
}
