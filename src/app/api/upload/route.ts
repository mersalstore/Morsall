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

    // Save to public/uploads
    const uploadDir = join(process.cwd(), "public", "uploads");
    
    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueName = `${timestamp}-${cleanFileName}`;
    const filePath = join(uploadDir, uniqueName);

    await writeFile(filePath, buffer);

    // Return the relative URL
    const fileUrl = `/uploads/${uniqueName}`;

    return NextResponse.json({ url: fileUrl });

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
