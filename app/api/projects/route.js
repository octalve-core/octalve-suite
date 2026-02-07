import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort");
    const clientEmail = searchParams.get("client_email");
    const status = searchParams.get("status");

    try {
        const where = {};
        if (clientEmail) where.clientEmail = clientEmail;
        if (status) where.status = status;

        let orderBy = { createdAt: "desc" };
        if (sort) {
            const desc = sort.startsWith("-");
            const field = desc ? sort.slice(1) : sort;
            // Map snake_case to camelCase
            const fieldMap = {
                created_date: "createdAt",
                updated_date: "updatedAt",
                target_completion_date: "targetCompletionDate",
            };
            orderBy = { [fieldMap[field] || field]: desc ? "desc" : "asc" };
        }

        const projects = await prisma.project.findMany({
            where,
            orderBy,
            include: {
                assignedPm: true,
                phases: {
                    orderBy: { order: "asc" },
                },
                _count: {
                    select: { phases: true, deliverables: true },
                },
            },
        });

        // Transform to match expected format
        const transformed = projects.map((p) => ({
            id: p.id,
            name: p.name,
            client_name: p.clientName,
            client_email: p.clientEmail,
            suite_type: p.suiteType,
            status: p.status,
            progress_percentage: p.progressPercentage,
            target_completion_date: p.targetCompletionDate?.toISOString().slice(0, 10),
            internal_notes: p.internalNotes,
            tags: p.tags ? JSON.parse(p.tags) : [],
            project_code: p.projectCode,
            assigned_pm: p.assignedPm?.email,
            created_date: p.createdAt.toISOString(),
            updated_date: p.updatedAt.toISOString(),
        }));

        return NextResponse.json(transformed);
    } catch (error) {
        console.error("Projects GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        const project = await prisma.project.create({
            data: {
                name: data.name,
                clientName: data.client_name,
                clientEmail: data.client_email,
                suiteType: data.suite_type,
                status: data.status || "active",
                progressPercentage: data.progress_percentage || 0,
                targetCompletionDate: data.target_completion_date
                    ? new Date(data.target_completion_date)
                    : null,
                internalNotes: data.internal_notes,
                tags: data.tags ? JSON.stringify(data.tags) : null,
                projectCode: data.project_code,
                assignedPmId: data.assigned_pm_id,
            },
        });

        return NextResponse.json(
            {
                id: project.id,
                name: project.name,
                client_name: project.clientName,
                client_email: project.clientEmail,
                suite_type: project.suiteType,
                status: project.status,
                progress_percentage: project.progressPercentage,
                target_completion_date: project.targetCompletionDate?.toISOString().slice(0, 10),
                project_code: project.projectCode,
                created_date: project.createdAt.toISOString(),
                updated_date: project.updatedAt.toISOString(),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Projects POST error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
