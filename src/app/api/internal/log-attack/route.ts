import { NextRequest, NextResponse } from "next/server";
import { logSecurity, autoBlockIfAbusive } from "@/lib/security-log";

export async function POST(req: NextRequest) {
  const internalHeader = req.headers.get("x-internal-firewall");
  if (!internalHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, ip, endpoint, method, url, userAgent } = body;

    if (!type || !ip) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Log the security incident as CRITICAL since it's a blocked attack payload
    await logSecurity({
      type,
      severity: "CRITICAL",
      ip,
      userAgent,
      endpoint,
      method,
      message: `Lightweight Firewall blocked malicious request: URL = ${url}`,
      details: { url },
    });

    // Auto-block the IP for 24 hours if they trigger 3 security violations in a short timeframe
    const blocked = await autoBlockIfAbusive(ip, type, 3, 24);

    return NextResponse.json({ success: true, blocked });
  } catch (e: any) {
    console.error("[log-attack] error:", e);
    return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 });
  }
}
