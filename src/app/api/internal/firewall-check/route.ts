import { NextRequest, NextResponse } from "next/server";
import { isIpBlocked } from "@/lib/security-log";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ip = searchParams.get("ip");

  if (!ip) {
    return NextResponse.json({ blocked: false }, { status: 400 });
  }

  // Verification header to prevent arbitrary external scanning of blocked status
  const internalHeader = req.headers.get("x-internal-firewall");
  if (!internalHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const blocked = await isIpBlocked(ip);
    return NextResponse.json({ blocked });
  } catch (e: any) {
    console.error("[firewall-check] error:", e);
    return NextResponse.json({ blocked: false, error: e.message || "Internal error" }, { status: 500 });
  }
}
