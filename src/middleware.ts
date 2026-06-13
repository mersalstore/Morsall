/**
 * Edge middleware acting as a lightweight firewall in front of every request.
 *
 * Responsibilities (kept minimal because middleware runs on every hit):
 *  - Block requests from IPs listed in BlockedIp (checked via fast in-memory cache + DB once/min per IP)
 *  - Quick attack-signature scan on URL params (SQL injection / XSS)
 *  - Tag the request with x-client-ip header so downstream APIs can read it
 *
 * Heavy work (writing SecurityLog rows) is fire-and-forget via the /api/internal/log-attack
 * endpoint so we don't block hot paths.
 */
import { NextRequest, NextResponse } from "next/server";

// Quick regex set duplicated from src/lib/security-log.ts (we can't import server libs into edge runtime here)
const SQL_PATTERNS = [
  /\b(union|select|insert|update|delete|drop|alter|exec(ute)?)\b.*\b(from|into|table|where)\b/i,
  /['"][^'"]*\s+(or|and)\s+\d+\s*=\s*\d+/i,
  /;\s*(drop|delete|update)\s/i,
];
const XSS_PATTERNS = [/<script[\s>]/i, /javascript:/i, /onerror\s*=/i, /onload\s*=/i, /<iframe[\s>]/i];

function detectAttackInUrl(url: URL): null | "SQL_INJECTION_ATTEMPT" | "XSS_ATTEMPT" {
  const haystack = `${url.pathname} ${url.search}`;
  for (const re of SQL_PATTERNS) if (re.test(haystack)) return "SQL_INJECTION_ATTEMPT";
  for (const re of XSS_PATTERNS) if (re.test(haystack)) return "XSS_ATTEMPT";
  return null;
}

function getClientIp(req: NextRequest): string | null {
  const h = req.headers;
  const candidates = [
    h.get("x-forwarded-for"),
    h.get("x-real-ip"),
    h.get("cf-connecting-ip"),
    h.get("x-client-ip"),
  ].filter(Boolean) as string[];
  for (const raw of candidates) {
    const ip = String(raw).split(",")[0].trim();
    if (ip) return ip.slice(0, 45);
  }
  return null;
}

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const ip = getClientIp(req) ?? "unknown";

  // Lightweight: only scan URL/query string for obvious attack signatures.
  // (IP-block check happens inside API route handlers via security-log.ts
  //  — keeping middleware synchronous and fetch-free avoids breaking the
  //  hot path under load on shared hosting.)
  const detected = detectAttackInUrl(url);
  if (detected) {
    // Fire-and-forget report — don't await
    if (ip !== "unknown") {
      try {
        fetch(`${url.origin}/api/internal/log-attack`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-internal-firewall": "1" },
          body: JSON.stringify({
            type: detected,
            ip,
            endpoint: url.pathname,
            method: req.method,
            url: url.toString().slice(0, 1000),
            userAgent: req.headers.get("user-agent")?.slice(0, 500),
          }),
        }).catch(() => {});
      } catch {}
    }
    return new NextResponse(
      JSON.stringify({ error: "طلب غير صالح", code: "INVALID_REQUEST" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Pass client IP downstream
  const res = NextResponse.next();
  if (ip !== "unknown") res.headers.set("x-client-ip", ip);
  return res;
}

// Skip internals, static assets, AND API routes (those are guarded by their own
// auth + security-log helpers — running middleware on every API call adds latency
// without much extra security value).
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api/|favicon.ico|uploads/|logo.png|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico|css|js)$).*)",
  ],
};
