import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyAdmins } from "@/lib/notification";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { vendorProfile: true },
  });

  if (!user?.vendorProfile) {
    return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
  }

  const requests = await prisma.customDesignRequest.findMany({
    where: { vendorId: user.vendorProfile.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests, tier: user.vendorProfile.tier });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { vendorProfile: true },
  });

  if (!user?.vendorProfile) {
    return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
  }

  const vendor = user.vendorProfile;

  if (vendor.tier !== "CUSTOM_DESIGN") {
    return NextResponse.json(
      {
        error: "طلبات التصميم المخصص متاحة فقط لباقة Custom Design من Vixcell.",
        code: "PLAN_UPGRADE_REQUIRED",
      },
      { status: 403 },
    );
  }

  if (vendor.status !== "APPROVED") {
    return NextResponse.json(
      { error: "يجب الموافقة على حسابك أولاً قبل إنشاء طلبات التصميم." },
      { status: 403 },
    );
  }

  const body = await req.json();
  const { description, requirements } = body as {
    description?: string;
    requirements?: { colors?: string; references?: string; images?: string[] };
  };

  if (!description || description.trim().length < 10) {
    return NextResponse.json(
      { error: "الوصف مطلوب ويجب أن يكون 10 أحرف على الأقل." },
      { status: 400 },
    );
  }

  const request = await prisma.customDesignRequest.create({
    data: {
      vendorId: vendor.id,
      description: description.trim().slice(0, 5000),
      requirements: requirements ?? {},
      status: "PENDING",
    },
  });

  try {
    await notifyAdmins(
      "طلب تصميم مخصص جديد",
      `${vendor.storeName} أرسل طلب تصميم جديد من فريق Vixcell. اضغط لمراجعته.`,
      "vendor",
      "/admin/dashboard?tab=customDesignRequests",
    );
  } catch {}

  return NextResponse.json({ success: true, request });
}
