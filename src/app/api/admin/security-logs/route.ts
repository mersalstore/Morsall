import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";

const db = prisma as any;

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const severity = searchParams.get("severity");
  const ip = searchParams.get("ip");
  const search = searchParams.get("search");
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);

  const where: any = {};
  if (type && type !== "ALL") where.type = type;
  if (severity && severity !== "ALL") where.severity = severity;
  if (ip) where.ip = ip;
  if (search) {
    where.OR = [
      { userEmail: { contains: search } },
      { message: { contains: search } },
      { endpoint: { contains: search } },
    ];
  }

  try {
    const [logs, totalCount, byTypeAgg, bySeverityAgg, topIps, blockedIps] = await Promise.all([
      db.securityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      db.securityLog.count(),
      db.securityLog.groupBy({
        by: ["type"],
        _count: { _all: true },
        orderBy: { _count: { type: "desc" } },
        take: 10,
      }),
      db.securityLog.groupBy({
        by: ["severity"],
        _count: { _all: true },
      }),
      db.securityLog.groupBy({
        by: ["ip"],
        where: { ip: { not: null }, severity: { in: ["ALERT", "CRITICAL"] } },
        _count: { _all: true },
        orderBy: { _count: { ip: "desc" } },
        take: 10,
      }),
      db.blockedIp.findMany({ orderBy: { blockedAt: "desc" }, take: 50 }),
    ]);

    // Recent CRITICAL/ALERT events for dashboard banner
    const recentAlerts = await db.securityLog.findMany({
      where: { severity: { in: ["ALERT", "CRITICAL"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      logs,
      totalCount,
      stats: {
        byType: byTypeAgg.map((r: any) => ({ type: r.type, count: r._count._all })),
        bySeverity: bySeverityAgg.map((r: any) => ({ severity: r.severity, count: r._count._all })),
        topIps: topIps.map((r: any) => ({ ip: r.ip, count: r._count._all })),
      },
      blockedIps,
      recentAlerts,
    });
  } catch (e: any) {
    console.error("security-logs GET error:", e);
    return NextResponse.json({ error: e?.message || "Internal Error" }, { status: 500 });
  }
}

// Mark a log as resolved or block/unblock an IP
export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();
  const userEmail = (session.user as any)?.email;

  const body = await req.json();
  const { action, logId, ip, ttlHours, reason } = body as {
    action: "RESOLVE" | "BLOCK_IP" | "UNBLOCK_IP";
    logId?: string;
    ip?: string;
    ttlHours?: number;
    reason?: string;
  };

  try {
    if (action === "RESOLVE" && logId) {
      await db.securityLog.update({
        where: { id: logId },
        data: { resolved: true, resolvedBy: userEmail, resolvedAt: new Date() },
      });
      return NextResponse.json({ success: true });
    }
    if (action === "BLOCK_IP" && ip) {
      const expiresAt = ttlHours ? new Date(Date.now() + ttlHours * 60 * 60 * 1000) : null;
      await db.blockedIp.upsert({
        where: { ip },
        create: { ip, reason: reason || "Manual block by admin", blockedBy: userEmail, expiresAt },
        update: { reason: reason || "Manual block by admin", blockedBy: userEmail, expiresAt },
      });
      return NextResponse.json({ success: true });
    }
    if (action === "UNBLOCK_IP" && ip) {
      await db.blockedIp.delete({ where: { ip } }).catch(() => {});
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    console.error("security-logs PATCH error:", e);
    return NextResponse.json({ error: e?.message || "Internal Error" }, { status: 500 });
  }
}
