import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, full_name, role } = body;

        if (!email || !full_name || !role) {
            return NextResponse.json(
                { error: "Email, full_name, and role are required" },
                { status: 400 }
            );
        }

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    fullName: full_name,
                    role: role === "admin" ? "admin" : "client",
                },
            });
        }

        // Set auth cookie
        const cookieStore = await cookies();
        cookieStore.set("octalve_user_email", email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return NextResponse.json({
            email: user.email,
            full_name: user.fullName,
            role: user.role,
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
