import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const secret = searchParams.get("secret");

  if (secret !== "mersal123") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" }
    });
    return NextResponse.json({ success: true, message: `User ${email} is now ADMIN. Please log out and log in again.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
