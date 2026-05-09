import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  const prisma = new PrismaClient();
  try {
    const categories = await prisma.category.findMany({
      take: 5
    });
    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message,
      stack: err.stack,
      env_engine: process.env.PRISMA_CLIENT_ENGINE_TYPE
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
