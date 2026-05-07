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
    let uploadDir = join(projectRoot, "public", "uploads");
    
    // Detect if we are on Vercel or a restricted environment
    const isRestricted = projectRoot.includes('var/task') || process.env.VERCEL === '1';
    const HOSTINGER_IP = "82.198.228.182"; // Your Correct Hostinger Web IP
    const PROXY_SECRET = "Mersal_Internal_Proxy_2026"; // Secure token
    
    if (isRestricted) {
      console.log("Vercel detected. Proxying upload to Hostinger...");
      try {
        // Prepare to forward the request to Hostinger
        const forwardData = new FormData();
        forwardData.append("file", file);
        
        const response = await fetch(`http://${HOSTINGER_IP}/api/upload`, {
          method: "POST",
          body: forwardData,
          headers: {
            "X-Proxy-Secret": PROXY_SECRET,
            "Host": "morsall.com" // Important for Hostinger vhost detection
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          return NextResponse.json(result);
        } else {
          const errText = await response.text();
          throw new Error(`Hostinger Proxy Failed: ${errText}`);
        }
      } catch (proxyError: any) {
        console.error("Proxy Error:", proxyError);
        return NextResponse.json({ 
          error: "فشل تحويل الملف لـ Hostinger. يرجى التأكد من تشغيل الموقع على Hostinger مباشرة." 
        }, { status: 500 });
      }
    }

    // --- FROM HERE DOWN: We are on Hostinger or local ---
    
    // Check if we are receiving a proxied request from Vercel
    const incomingSecret = req.headers.get("X-Proxy-Secret");
    // If it's a proxy request, we bypass standard auth check because it was checked on Vercel
    // Or we rely on the secret token
    if (incomingSecret !== PROXY_SECRET) {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    // Force Hostinger path if we detect we are on the Hostinger server
    const HOSTINGER_ROOT = "/home/u754458241/domains/morsall.com/public_html/.builds/source";
    if (existsSync(HOSTINGER_ROOT)) {
      uploadDir = join(HOSTINGER_ROOT, "public", "uploads");
    }
    
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
