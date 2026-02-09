import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { getUser, isAuthenticated } = getKindeServerSession();

  try {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const kindeUser = await getUser();

    if (!kindeUser || !kindeUser.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Try to find existing user, or create/update from Kinde data
    let user = await prisma.user.findUnique({
      where: { email: kindeUser.email },
    });

    if (!user) {
      // Create user from Kinde data
      user = await prisma.user.create({
        data: {
          email: kindeUser.email,
          fullName:
            `${kindeUser.given_name || ""} ${kindeUser.family_name || ""}`.trim() ||
            kindeUser.email,
          kindeId: kindeUser.id,
          role: "client", // Default role for new users
        },
      });
    } else if (!user.kindeId && kindeUser.id) {
      // Update existing user with Kinde ID if missing
      user = await prisma.user.update({
        where: { email: kindeUser.email },
        data: { kindeId: kindeUser.id },
      });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      kinde_id: user.kindeId,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
