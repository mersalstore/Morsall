import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    console.log(`[REG] Registration attempt for: ${email}`);

    if (!email || !password || !name) {
      console.log(`[REG] Missing fields: email=${!!email}, password=${!!password}, name=${!!name}`);
      return NextResponse.json({ error: `Missing required fields: ${!email ? 'email ' : ''}${!password ? 'password ' : ''}${!name ? 'name' : ''}` }, { status: 400 });
    }

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`[REG] User already exists: ${email}`);
      return NextResponse.json({ error: "البريد الإلكتروني مسجل بالفعل" }, { status: 400 });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "CUSTOMER",
        isOnboarded: false,
      },
    });

    console.log(`[REG] User created successfully: ${user.id} (${email})`);

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error: any) {
    console.error("Registration error details:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
