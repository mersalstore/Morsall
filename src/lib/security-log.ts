/**
 * Centralized security & activity logging.
 * Use everywhere sensitive things happen (login, payment, admin actions, suspicious patterns).
 */
import { prisma } from "./db";

export type SecuritySeverity = "INFO" | "WARN" | "ALERT" | "CRITICAL";

export type SecurityEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAIL"
  | "PASSWORD_RESET_ABUSE"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAIL"
  | "FAKE_RECEIPT"           // OCR detected invalid receipt
  | "FAKE_CARD"              // Stripe / payment gateway flagged
  | "RATE_LIMIT"             // too many requests from one IP
  | "API_ABUSE"
  | "SQL_INJECTION_ATTEMPT"
  | "XSS_ATTEMPT"
  | "UNAUTHORIZED_ACCESS"
  | "PERMISSION_VIOLATION"
  | "SUSPICIOUS_PATTERN"
  | "ADMIN_ACTION"
  | "FILE_UPLOAD_ABUSE"
  | "ACCOUNT_TAKEOVER_ATTEMPT";

interface LogParams {
  type: SecurityEventType;
  severity?: SecuritySeverity;
  ip?: string | null;
  userAgent?: string | null;
  userId?: string | null;
  userEmail?: string | null;
  vendorId?: string | null;
  endpoint?: string | null;
  method?: string | null;
  message?: string;
  details?: any;
}

const db = prisma as any;

/** Extract a client IP from common request shapes (Next.js Request / NextRequest / NextAuth req). */
export function extractIp(req: any): string | null {
  if (!req) return null;
  const headers = (typeof req.headers?.get === "function")
    ? {
        get: (k: string) => req.headers.get(k),
      }
    : req.headers;
  const pick = (k: string) => {
    if (!headers) return null;
    if (typeof headers.get === "function") return headers.get(k);
    return headers[k] ?? headers[k.toLowerCase()];
  };
  const candidates = [
    pick("x-forwarded-for"),
    pick("x-real-ip"),
    pick("cf-connecting-ip"),
    pick("x-client-ip"),
    req.ip,
    req.socket?.remoteAddress,
    req.connection?.remoteAddress,
  ].filter(Boolean) as string[];
  for (const raw of candidates) {
    const ip = String(raw).split(",")[0].trim();
    if (ip) return ip.slice(0, 45);
  }
  return null;
}

export function extractUserAgent(req: any): string | null {
  if (!req?.headers) return null;
  const get = typeof req.headers.get === "function" ? req.headers.get.bind(req.headers) : (k: string) => req.headers[k];
  return (get("user-agent") || null)?.slice(0, 500) ?? null;
}

/** Log a security/activity event. Fails silently — must not interrupt the user flow. */
export async function logSecurity(params: LogParams): Promise<void> {
  try {
    await db.securityLog.create({
      data: {
        type: params.type,
        severity: params.severity ?? "INFO",
        ip: params.ip ?? null,
        userAgent: params.userAgent ?? null,
        userId: params.userId ?? null,
        userEmail: params.userEmail ? params.userEmail.toLowerCase().slice(0, 191) : null,
        vendorId: params.vendorId ?? null,
        endpoint: params.endpoint?.slice(0, 500) ?? null,
        method: params.method ?? null,
        message: params.message?.slice(0, 5000) ?? null,
        details: params.details ?? undefined,
      },
    });
  } catch (e) {
    // Best-effort; never throw from logging
    console.error("[security-log] failed:", e);
  }
}

/** Check if an IP has been blocked (manual or auto-blocked from abuse). */
export async function isIpBlocked(ip: string | null | undefined): Promise<boolean> {
  if (!ip) return false;
  try {
    const row = await db.blockedIp.findUnique({ where: { ip } });
    if (!row) return false;
    if (row.expiresAt && new Date(row.expiresAt) < new Date()) {
      // Expired — auto-clear
      await db.blockedIp.delete({ where: { ip } }).catch(() => {});
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Count how many failed events of a given type happened for a given IP in the last `minutes`.
 * Used to auto-detect brute-force / abuse.
 */
export async function recentFailCount(ip: string | null | undefined, type: SecurityEventType, minutes = 15): Promise<number> {
  if (!ip) return 0;
  try {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    return await db.securityLog.count({
      where: { ip, type, createdAt: { gte: since } },
    });
  } catch {
    return 0;
  }
}

/** Auto-block an IP after too many fails. Returns true if just blocked. */
export async function autoBlockIfAbusive(ip: string | null | undefined, type: SecurityEventType, threshold = 8, hoursTtl = 6): Promise<boolean> {
  if (!ip) return false;
  try {
    const count = await recentFailCount(ip, type, 60);
    if (count < threshold) return false;
    const expiresAt = new Date(Date.now() + hoursTtl * 60 * 60 * 1000);
    await db.blockedIp.upsert({
      where: { ip },
      create: { ip, reason: `Auto-blocked: ${count} ${type} events in 1h`, attempts: count, expiresAt },
      update: { attempts: count, expiresAt, reason: `Auto-blocked: ${count} ${type} events in 1h` },
    });
    await logSecurity({
      type: "RATE_LIMIT",
      severity: "CRITICAL",
      ip,
      message: `Auto-blocked IP for ${hoursTtl}h after ${count} ${type} events`,
    });
    return true;
  } catch {
    return false;
  }
}

/** Simple pattern detector for common attack signatures. */
const SQL_PATTERNS = [
  /\b(union|select|insert|update|delete|drop|alter|exec(ute)?)\b.*\b(from|into|table|where)\b/i,
  /['"][^'"]*\s+(or|and)\s+\d+\s*=\s*\d+/i,
  /;\s*(drop|delete|update)\s/i,
  /--\s|\/\*|\*\//,
];

const XSS_PATTERNS = [
  /<script[\s>]/i,
  /javascript:/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /<iframe[\s>]/i,
];

export function detectAttackPattern(value: string): null | "SQL_INJECTION_ATTEMPT" | "XSS_ATTEMPT" {
  if (!value || typeof value !== "string") return null;
  for (const re of SQL_PATTERNS) if (re.test(value)) return "SQL_INJECTION_ATTEMPT";
  for (const re of XSS_PATTERNS) if (re.test(value)) return "XSS_ATTEMPT";
  return null;
}

/** Scan an object's values for attack patterns. */
export function scanForAttacks(obj: any): null | "SQL_INJECTION_ATTEMPT" | "XSS_ATTEMPT" {
  if (!obj) return null;
  const stack = [obj];
  let n = 0;
  while (stack.length && n++ < 200) {
    const cur = stack.pop();
    if (typeof cur === "string") {
      const r = detectAttackPattern(cur);
      if (r) return r;
    } else if (Array.isArray(cur)) {
      stack.push(...cur);
    } else if (cur && typeof cur === "object") {
      for (const k of Object.keys(cur)) stack.push(cur[k]);
    }
  }
  return null;
}
