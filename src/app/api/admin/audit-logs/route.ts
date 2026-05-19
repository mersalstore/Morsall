import { NextResponse } from "next/server";
import { getAuditLogs, saveAuditLog } from "@/lib/audit";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const logs = await getAuditLogs();
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const { action, entityId, details } = await req.json();

    if (!action) {
      return NextResponse.json({ error: "العملية مطلوبة" }, { status: 400 });
    }

    await saveAuditLog({
      userId: (session.user as any).id,
      action,
      entityId,
      details,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
