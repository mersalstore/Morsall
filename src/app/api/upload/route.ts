import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join, isAbsolute } from "path";
import { existsSync } from "fs";

export async function POST(req: Request) {
  try {
    // ── Auth check ───────────────────────────────────────────
    const PROXY_SECRET = process.env.INTERNAL_UPLOAD_PROXY_SECRET?.trim() || "Mersal_Internal_Proxy_2026";
    const incomingSecret = req.headers.get("X-Proxy-Secret");
    const isTrustedProxy = incomingSecret === PROXY_SECRET;

    const session = await getServerSession(authOptions);
    if (!session && !isTrustedProxy) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Parse FormData ────────────────────────────────────────
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

    const MAX_SIZE = Number(process.env.MAX_UPLOAD_SIZE_MB || "10") * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `حجم الصورة كبير جدًا. الحد الأقصى ${process.env.MAX_UPLOAD_SIZE_MB || "10"}MB` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ── Determine upload directory ────────────────────────────
    // Priority: UPLOAD_DIR env → public/uploads (local fallback)
    const projectRoot = process.cwd();
    const configuredPath = process.env.UPLOAD_DIR?.trim();

    let uploadDir: string;
    if (configuredPath) {
      uploadDir = isAbsolute(configuredPath) ? configuredPath : join(projectRoot, configuredPath);
    } else {
      uploadDir = join(projectRoot, "public", "uploads");
    }

    console.log(`[UPLOAD] dir=${uploadDir}, file=${file.name}, size=${file.size}`);

    // ── Ensure directory exists ───────────────────────────────
    if (!existsSync(uploadDir)) {
      console.log(`[UPLOAD] Creating directory: ${uploadDir}`);
      await mkdir(uploadDir, { recursive: true, mode: 0o755 });
    }

    // ── Generate unique filename ──────────────────────────────
    const timestamp = Date.now();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = file.name
      .replace(/\.[^.]+$/, "")           // remove extension
      .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_") // keep Arabic + alphanumeric
      .slice(0, 40);
    const uniqueName = `${timestamp}-${safeName}.${ext}`;
    const filePath = join(uploadDir, uniqueName);

    // ── Write file ────────────────────────────────────────────
    await writeFile(filePath, buffer);
    console.log(`[UPLOAD] Success: ${filePath}`);

    // ── Return public URL ─────────────────────────────────────
    // Always return /uploads/<name> — the server or Next.js will serve it
    return NextResponse.json({
      url: `/uploads/${uniqueName}`,
      success: true,
    });

  } catch (error: any) {
    console.error("[UPLOAD] Error:", error);
    return NextResponse.json(
      {
        error: "فشل رفع الصورة",
        details: error?.message || "خطأ غير معروف",
      },
      { status: 500 }
    );
  }
}
