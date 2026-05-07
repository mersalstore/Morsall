import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  return NextResponse.json({
    cwd: process.cwd(),
    dirname: __dirname,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    },
    resolvedPublic: path.resolve("./public"),
    platform: process.platform,
  });
}
