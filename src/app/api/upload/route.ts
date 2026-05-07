import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { isAbsolute, join } from "path";
import { existsSync } from "fs";

export async function POST(req: Request) {
  try {
    const HOSTINGER_IP = process.env.HOSTINGER_UPLOAD_HOST?.trim() || "82.198.228.182";
    const PROXY_SECRET = process.env.INTERNAL_UPLOAD_PROXY_SECRET?.trim() || "Mersal_Internal_Proxy_2026";
    const MAX_FILE_SIZE = Number(process.env.MAX_UPLOAD_SIZE_MB || "10") * 1024 * 1024;
    const PROXY_TIMEOUT_MS = Number(process.env.UPLOAD_PROXY_TIMEOUT_MS || "15000");
    const proxyHop = Number(req.headers.get("X-Upload-Proxy-Hop") || "0");
    const incomingSecret = req.headers.get("X-Proxy-Secret");
    const isTrustedProxy = incomingSecret === PROXY_SECRET;

    const session = await getServerSession(authOptions);
    if (!session && !isTrustedProxy) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse FormData
    let data: FormData;
    try {
      data = await req.formData();
    } catch (e) {
      return NextResponse.json({ error: "يرجى إرسال الملف كـ FormData" }, { status: 400 });
    }

    const file = data.get("file") as File;
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "لم يتم رفع أي ملف" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "يسمح فقط برفع الصور" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `حجم الصورة كبير جدًا. الحد الأقصى ${process.env.MAX_UPLOAD_SIZE_MB || "10"}MB` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine the upload directory
    const projectRoot = process.cwd();
    const configuredUploadPath = process.env.UPLOAD_DIR?.trim();
    let uploadDir = configuredUploadPath
      ? (isAbsolute(configuredUploadPath)
          ? configuredUploadPath
          : join(projectRoot, configuredUploadPath))
      : join(projectRoot, "public", "uploads");
    
    // Detect if we are on Vercel or a restricted environment
    const isRestricted = projectRoot.includes('var/task') || process.env.VERCEL === '1';
    
    if (isRestricted) {
      if (proxyHop > 0) {
        return NextResponse.json(
          { error: "حلقة بروكسي مكتشفة. اضبط HOSTINGER_UPLOAD_TARGETS على عنوان Hostinger المباشر." },
          { status: 500 }
        );
      }

      const configuredTargets = process.env.HOSTINGER_UPLOAD_TARGETS?.trim();
      const targets = configuredTargets
        ? configuredTargets.split(",").map((t) => t.trim()).filter(Boolean)
        : [`https://morsall.com/api/upload`, `http://${HOSTINGER_IP}/api/upload`];

      let lastError = "unknown error";
      for (const target of targets) {
        try {
          const forwardData = new FormData();
          forwardData.append("file", file);

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
          const targetHost = new URL(target).hostname;
          const headers: Record<string, string> = {
            "X-Proxy-Secret": PROXY_SECRET,
            "X-Upload-Proxy-Hop": String(proxyHop + 1),
          };
          if (targetHost === HOSTINGER_IP) {
            headers["Host"] = "morsall.com";
          }

          const response = await fetch(target, {
            method: "POST",
            body: forwardData,
            headers,
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (response.ok) {
            const result = await response.json();
            return NextResponse.json(result);
          }

          lastError = await response.text();
          console.error("Upload proxy target failed:", target, lastError);
        } catch (error: any) {
          lastError = error?.message || String(error);
          console.error("Upload proxy exception:", target, lastError);
        }
      }

      return NextResponse.json(
        { error: `فشل تحويل الملف إلى Hostinger عبر كل المسارات. آخر خطأ: ${lastError}` },
        { status: 500 }
      );
    }

    // --- FROM HERE DOWN: We are on Hostinger or local ---
    
    // Ensure the directory exists
    try {
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true, mode: 0o755 });
      }
    } catch (dirError: any) {
      return NextResponse.json({ error: `فشل إنشاء مجلد الرفع: ${dirError.message}` }, { status: 500 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueName = `${timestamp}-${cleanFileName}`;
    const filePath = join(uploadDir, uniqueName);

    try {
      await writeFile(filePath, buffer);
    } catch (writeError: any) {
      return NextResponse.json({ error: `فشل حفظ الملف: ${writeError.message}` }, { status: 500 });
    }

    // Return the relative URL
    const fileUrl = `/uploads/${uniqueName}`;
    return NextResponse.json({ url: fileUrl });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "خطأ غير متوقع في رفع الملف" }, { status: 500 });
  }
}
