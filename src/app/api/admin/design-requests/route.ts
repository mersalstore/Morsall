import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";
import { prisma } from "@/lib/db";
import { notifyVendorByUserId } from "@/lib/notification";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  const requests = await prisma.customDesignRequest.findMany({
    include: {
      vendor: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  const body = await req.json();
  const { id, status, adminNotes, price } = body as {
    id: string;
    status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    adminNotes?: string;
    price?: number;
  };

  if (!id) {
    return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
  }

  const existing = await prisma.customDesignRequest.findUnique({
    where: { id },
    include: { vendor: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  }

  const data: any = {};
  if (status !== undefined) data.status = status;
  if (adminNotes !== undefined) data.adminNotes = adminNotes;
  if (price !== undefined) data.price = Number(price);

  const updated = await prisma.customDesignRequest.update({
    where: { id },
    data,
  });

  if (status && status !== existing.status) {
    const statusLabels: Record<string, string> = {
      PENDING: "بانتظار المراجعة",
      IN_PROGRESS: "قيد التنفيذ",
      COMPLETED: "تم الإنجاز",
      CANCELLED: "تم الإلغاء",
    };
    try {
      await notifyVendorByUserId(
        existing.vendor.userId,
        "تحديث طلب التصميم",
        `طلب التصميم المخصص الخاص بك أصبح: ${statusLabels[status] ?? status}`,
        "vendor",
        "/vendor/dashboard?tab=customDesign",
      );
    } catch {}
  }

  return NextResponse.json({ success: true, request: updated });
}
