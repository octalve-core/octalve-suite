import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const templates = await prisma.template.findMany({
            orderBy: { createdAt: "desc" },
        });

        const transformed = templates.map((t) => ({
            id: t.id,
            name: t.name,
            suite_type: t.suiteType,
            description: t.description,
            phases: JSON.parse(t.phases),
            created_date: t.createdAt.toISOString(),
            updated_date: t.updatedAt.toISOString(),
        }));

        return NextResponse.json(transformed);
    } catch (error) {
        console.error("Templates GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        const template = await prisma.template.create({
            data: {
                name: data.name,
                suiteType: data.suite_type,
                description: data.description,
                phases: JSON.stringify(data.phases || []),
            },
        });

        return NextResponse.json(
            {
                id: template.id,
                name: template.name,
                suite_type: template.suiteType,
                description: template.description,
                phases: JSON.parse(template.phases),
                created_date: template.createdAt.toISOString(),
                updated_date: template.updatedAt.toISOString(),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Templates POST error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
