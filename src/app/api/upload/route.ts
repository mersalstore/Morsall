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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // --- TRY LOCAL WRITE FIRST (Works on Hostinger) ---
    try {
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true, mode: 0o755 });
      }
      
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueName = `${timestamp}-${cleanFileName}`;
      const filePath = join(uploadDir, uniqueName);
      
      await writeFile(filePath, buffer);
      
      return NextResponse.json({ url: `/uploads/${uniqueName}` });
    } catch (writeError: any) {
      // If the error is NOT a read-only filesystem error, it's a real failure
      const isReadOnly = writeError.code === 'EROFS' || projectRoot.includes('var/task') || writeError.message.includes('read-only');
      if (!isReadOnly) {
        throw writeError;
      }
      
      console.log("Local write failed (Read-Only). Attempting Proxy to Hostinger...");
      
      // --- FALLBACK: PROXY TO HOSTINGER (Works on Vercel during propagation) ---
      const proxyHop = Number(req.headers.get("X-Upload-Proxy-Hop") || "0");
      if (proxyHop > 0) {
        return NextResponse.json({ error: "Recursion detected" }, { status: 508 });
      }

      const PROXY_SECRET = process.env.INTERNAL_UPLOAD_PROXY_SECRET?.trim() || "Mersal_Internal_Proxy_2026";
      const PROXY_TIMEOUT_MS = Number(process.env.UPLOAD_PROXY_TIMEOUT_MS || "20000");
      const HOSTINGER_IP = process.env.HOSTINGER_UPLOAD_HOST?.trim() || "82.198.228.182";

      // Try the IP target first as it's the most reliable bypass
      const target = `http://${HOSTINGER_IP}/api/upload`;
      
      try {
        const forwardData = new FormData();
        forwardData.append("file", file);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

        const response = await fetch(target, {
          method: "POST",
          body: forwardData,
          headers: {
            "X-Proxy-Secret": PROXY_SECRET,
            "X-Upload-Proxy-Hop": "1",
            "Host": "morsall.com" // CRITICAL for Hostinger/LiteSpeed
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          return NextResponse.json(await response.json());
        }
        
        const errText = await response.text();
        return NextResponse.json({ 
          error: `فشل الرفع التلقائي (الرمز: ${response.status}). يرجى التأكد من انتقال الدومين بالكامل لـ Hostinger.` 
        }, { status: 500 });

      } catch (proxyError: any) {
        return NextResponse.json({ 
          error: `خطأ في الاتصال بالسيرفر: ${proxyError.message}. يرجى محاولة الرفع بعد قليل.` 
        }, { status: 500 });
      }
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "خطأ غير متوقع في رفع الملف" }, { status: 500 });
  }
}
