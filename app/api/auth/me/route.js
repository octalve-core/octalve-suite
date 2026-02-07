import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get("octalve_user_email")?.value;

    if (!userEmail) {
        return NextResponse.json(
            { error: "Not authenticated" },
            { status: 401 }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            email: user.email,
            full_name: user.fullName,
            role: user.role,
        });
    } catch (error) {
        console.error("Auth me error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
