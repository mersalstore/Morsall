import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { existsSync } from "fs";
import { join } from "path";
import { access, constants } from "fs/promises";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectRoot = process.cwd();
    const uploadDir = process.env.UPLOAD_DIR || "public/uploads";
    const fullPath = join(projectRoot, uploadDir);
    
    let isWritable = false;
    try {
      if (existsSync(fullPath)) {
        await access(fullPath, constants.W_OK);
        isWritable = true;
      }
    } catch (e) {
      isWritable = false;
    }

    return NextResponse.json({
      status: "online",
      server: process.env.VERCEL === '1' ? 'Vercel' : 'Hostinger/Direct',
      cwd: projectRoot,
      uploadConfig: {
        dir: uploadDir,
        fullPath: fullPath,
        exists: existsSync(fullPath),
        isWritable: isWritable,
        maxSize: process.env.MAX_UPLOAD_SIZE_MB || "10"
      },
      proxy: {
        host: process.env.HOSTINGER_UPLOAD_HOST || "Not Set",
        secretSet: !!process.env.INTERNAL_UPLOAD_PROXY_SECRET
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
