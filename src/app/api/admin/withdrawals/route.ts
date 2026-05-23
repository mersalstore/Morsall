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

    // Notify vendor
    try {
      const fullWithdrawal = await prisma.withdrawal.findUnique({
        where: { id },
        include: { vendor: { include: { user: true } } }
      });
      if (fullWithdrawal?.vendor?.user) {
        const { notifyVendorByUserId } = await import("@/lib/notification");
        await notifyVendorByUserId(
          fullWithdrawal.vendor.user.id,
          status === "APPROVED" ? "✅ تمت الموافقة على طلب السحب" : "❌ تم رفض طلب السحب",
          `طلب السحب بمبلغ ${fullWithdrawal.amount.toLocaleString()} ج.س ${status === "APPROVED" ? "تمت الموافقة عليه" : "تم رفضه"}`,
          "withdrawal",
          "/vendor/dashboard"
        );
      }
    } catch {}

    return NextResponse.json(updated);

  } catch (error) {
    console.error("Update Withdrawal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
