import { PrismaClient } from "@prisma/client";

// Append connection pool config to DATABASE_URL to reduce memory pressure on
// shared hosting (Hostinger), which causes tokio "timer has gone away" panics.
function buildDatasourceUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  try {
    const u = new URL(raw);
    if (!u.searchParams.has("connection_limit")) u.searchParams.set("connection_limit", "5");
    if (!u.searchParams.has("pool_timeout")) u.searchParams.set("pool_timeout", "20");
    if (!u.searchParams.has("connect_timeout")) u.searchParams.set("connect_timeout", "15");
    return u.toString();
  } catch {
    return raw;
  }
}

function createClient(): PrismaClient {
  const dbUrl = buildDatasourceUrl();
  return new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "info", "warn", "error"],
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
  });
}

// Detect the Prisma "timer has gone away" / Rust panic which is non-recoverable
// for the current engine instance — we recreate the client and retry once.
function isRecoverablePrismaPanic(err: any): boolean {
  if (!err) return false;
  const name = err?.name || err?.constructor?.name || "";
  const msg = String(err?.message || "");
  return (
    name === "PrismaClientRustPanicError" ||
    msg.includes("timer has gone away") ||
    msg.includes("PANIC") ||
    msg.includes("Response from the Engine was empty")
  );
}

// The model method names we want to wrap with retry logic.
const RETRYABLE_METHODS = new Set([
  "findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow",
  "findMany", "create", "createMany", "update", "updateMany",
  "upsert", "delete", "deleteMany", "count", "aggregate", "groupBy",
]);

declare const globalThis: {
  prismaGlobal: PrismaClient | undefined;
} & typeof global;

function buildProxiedClient(): PrismaClient {
  let client = globalThis.prismaGlobal ?? createClient();
  globalThis.prismaGlobal = client;

  const handler: ProxyHandler<PrismaClient> = {
    get(_target, modelProp: string | symbol) {
      const current: any = globalThis.prismaGlobal ?? client;
      const modelValue = current[modelProp as any];

      // Pass through non-model props ($connect, $transaction, symbols, etc.)
      if (
        typeof modelProp === "symbol" ||
        (typeof modelProp === "string" && modelProp.startsWith("$")) ||
        modelValue == null ||
        typeof modelValue !== "object"
      ) {
        return typeof modelValue === "function" ? modelValue.bind(current) : modelValue;
      }

      return new Proxy(modelValue, {
        get(modelTarget, methodProp: string | symbol) {
          const method = (modelTarget as any)[methodProp];
          if (typeof methodProp === "string" && RETRYABLE_METHODS.has(methodProp) && typeof method === "function") {
            return async (...args: any[]) => {
              let lastErr: any;
              // Up to 4 attempts: on "timer has gone away" panic, drop the engine
              // (fire-and-forget disconnect so it can't hang) and spin a fresh client.
              for (let attempt = 0; attempt < 4; attempt++) {
                try {
                  const live: any = globalThis.prismaGlobal ?? client;
                  return await live[modelProp as any][methodProp](...args);
                } catch (err) {
                  lastErr = err;
                  if (!isRecoverablePrismaPanic(err)) throw err;
                  // Don't await — a panicked engine's $disconnect can hang.
                  try { (globalThis.prismaGlobal as any)?.$disconnect?.().catch(() => {}); } catch {}
                  await new Promise((r) => setTimeout(r, 150 + attempt * 250));
                  const fresh = createClient();
                  globalThis.prismaGlobal = fresh;
                  client = fresh;
                }
              }
              throw lastErr;
            };
          }
          return typeof method === "function" ? method.bind(modelTarget) : method;
        },
      });
    },
  };

  return new Proxy(client, handler);
}

const prisma = buildProxiedClient();

export { prisma };
export default prisma;
