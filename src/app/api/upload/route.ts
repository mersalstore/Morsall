import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine the upload directory
    const projectRoot = process.cwd();
    const uploadDir = join(projectRoot, "public", "uploads");
    
    console.log("Upload attempt details:", {
      cwd: projectRoot,
      uploadDir,
      exists: existsSync(uploadDir)
    });

    // Ensure the directory exists
    try {
      if (!existsSync(uploadDir)) {
        // Recursive true handles creating both public and uploads if missing
        await mkdir(uploadDir, { recursive: true, mode: 0o755 });
      }
    } catch (dirError: any) {
      console.error("Directory Creation Error:", dirError);
      // Check if we are on a read-only filesystem (typical of Vercel)
      if (dirError.code === 'EROFS' || projectRoot.includes('var/task') || dirError.message.includes('read-only')) {
        return NextResponse.json({ 
          error: "عذراً، نظام الملفات للقراءة فقط. يبدو أن الموقع ما زال يعمل على Vercel أو ببيئة مقيدة. يرجى التأكد من تشغيل الموقع من Hostinger عبر npm start." 
        }, { status: 500 });
      }
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
      console.error("File Write Error:", writeError);
      return NextResponse.json({ error: `فشل حفظ الملف: ${writeError.message}` }, { status: 500 });
    }

    // Return the relative URL
    const fileUrl = `/uploads/${uniqueName}`;
    return NextResponse.json({ url: fileUrl });

  } catch (error: any) {
    console.error("Upload API General Error:", error);
    return NextResponse.json({ error: error.message || "خطأ غير متوقع في رفع الملف" }, { status: 500 });
  }
}
