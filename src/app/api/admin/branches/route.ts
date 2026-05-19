import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const branches = await prisma.branch.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(branches);
  } catch (error: any) {
    console.error("Fetch Branches Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const body = await req.json();
    const { name, location, phone } = body;

    if (!name || !location) {
      return NextResponse.json({ error: "الاسم والموقع مطلوبان" }, { status: 400 });
    }

    const branch = await prisma.branch.create({
      data: { name, location, phone }
    });

    return NextResponse.json(branch);
  } catch (error: any) {
    console.error("Create Branch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
