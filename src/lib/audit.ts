import { prisma } from "./db";
import fs from "fs";
import path from "path";

// Path for fallback file storage
const LOGS_DIR = path.join(process.cwd(), "storage");
const LOGS_FILE = path.join(LOGS_DIR, "audit_logs.json");

export interface AuditLogData {
  userId?: string;
  action: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
}

export async function saveAuditLog(data: AuditLogData) {
  const timestamp = new Date();
  const logEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    createdAt: timestamp.toISOString()
  };

  // 1. Try DB first (if migration exists)
  try {
    // We check if the auditLog model exists in prisma
    if ('auditLog' in prisma) {
      await (prisma as any).auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityId: data.entityId,
          details: data.details,
          ipAddress: data.ipAddress,
          createdAt: timestamp
        }
      });
      console.log("Audit log saved to Database successfully.");
      return;
    }
  } catch (err) {
    console.warn("Could not write AuditLog to database (migration might be pending):", err);
  }

  // 2. Fallback to Local JSON Storage
  try {
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    }

    let logs: any[] = [];
    if (fs.existsSync(LOGS_FILE)) {
      try {
        const fileContent = fs.readFileSync(LOGS_FILE, "utf-8");
        logs = JSON.parse(fileContent || "[]");
      } catch (parseErr) {
        logs = [];
      }
    }

    logs.unshift(logEntry);
    
    // Limit to last 500 logs to prevent huge files
    if (logs.length > 500) {
      logs = logs.slice(0, 500);
    }

    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), "utf-8");
    console.log("Audit log saved to local storage file successfully.");
  } catch (fileErr) {
    console.error("Failed to write audit log to file system:", fileErr);
  }
}

export async function getAuditLogs() {
  // 1. Try DB first
  try {
    if ('auditLog' in prisma) {
      return await (prisma as any).auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100
      });
    }
  } catch (err) {
    console.warn("Could not read AuditLog from database:", err);
  }

  // 2. Fallback to File system
  try {
    if (fs.existsSync(LOGS_FILE)) {
      const fileContent = fs.readFileSync(LOGS_FILE, "utf-8");
      return JSON.parse(fileContent || "[]");
    }
  } catch (err) {
    console.error("Failed to read audit logs from file system:", err);
  }

  return [];
}
