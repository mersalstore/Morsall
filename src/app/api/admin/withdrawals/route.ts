import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";

// GET all withdrawals
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        vendor: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(withdrawals);

  } catch (error) {
    console.error("Fetch Withdrawals Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH update withdrawal status
export async function PATCH(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const { id, status } = await req.json();

    const updated = await prisma.withdrawal.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updated);

  } catch (error) {
    console.error("Update Withdrawal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
