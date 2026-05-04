import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { updates } = await req.json();
    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Invalid updates format" }, { status: 400 });
    }

    const results = await Promise.all(
      updates.map(async (u) => {
        try {
          return await prisma.order.update({
            where: { id: u.id },
            data: {
              status: u.status,
              ...(u.trackingNumber && { trackingNumber: u.trackingNumber })
            }
          });
        } catch (err) {
          console.error(`Failed to update order ${u.id}:`, err);
          return null;
        }
      })
    );

    const successfulCount = results.filter(r => r !== null).length;

    return NextResponse.json({ success: true, updated: successfulCount });
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
