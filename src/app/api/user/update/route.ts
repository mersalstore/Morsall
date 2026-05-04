import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!(session as any)?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, age, interests, phone, isOnboarded } = body;

    const updatedUser = await prisma.user.update({
      where: { email: (session as any).user.email },
      data: {
        name: name !== undefined ? name : undefined,
        age: (age && !isNaN(parseInt(age))) ? parseInt(age) : undefined,
        interests: interests !== undefined ? (Array.isArray(interests) ? interests.join(',') : interests) : undefined,
        phone: phone !== undefined ? phone : undefined,
        isOnboarded: isOnboarded !== undefined ? isOnboarded : undefined,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
