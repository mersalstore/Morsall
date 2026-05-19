import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { adminOnlyResponse } from "@/lib/session";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const emailLower = (session as any)?.user?.email?.trim().toLowerCase();
    const SUPER_ADMINS = ["blackhatsd.sd@gmail.com", "system@mersal.com", "hazem@mersal.com", "zomatube2012@gmail.com"];
    
    if (!emailLower || (!SUPER_ADMINS.includes(emailLower) && (session as any).user.role !== 'ADMIN')) {
      return adminOnlyResponse();
    }

    const vendors = await prisma.vendor.findMany({
      include: {
        user: true,
        plan: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(vendors);

  } catch (error) {
    console.error("Fetch Vendors Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const emailLower = (session as any)?.user?.email?.trim().toLowerCase();
    const SUPER_ADMINS = ["blackhatsd.sd@gmail.com", "system@mersal.com", "hazem@mersal.com", "zomatube2012@gmail.com"];
    
    if (!emailLower || (!SUPER_ADMINS.includes(emailLower) && (session as any).user.role !== 'ADMIN')) {
      return adminOnlyResponse();
    }

    const body = await req.json();
    const { 
      storeName, ownerName, ownerEmail, ownerPassword, phone, location,
      commissionType, commissionRate, fixedFee, subscriptionFee, trialDays 
    } = body;

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.default.hash(ownerPassword, 12);

    // Generate Slug
    const slugBase = storeName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-ء-ي0-9]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const subscriptionEndsAt = trialDays > 0 
      ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000) 
      : null;

    const vendor = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email: ownerEmail,
          name: ownerName,
          password: hashedPassword,
          role: "VENDOR",
          phone: phone,
          isOnboarded: true,
        }
      });

      return await tx.vendor.create({
        data: {
          userId: user.id,
          storeName,
          slug: `${slugBase}-${Math.random().toString(36).substring(2, 7)}`,
          location: location || "الخرطوم",
          status: "APPROVED",
          phone: phone,
          commissionType: commissionType || "PERCENTAGE",
          commissionRate: commissionRate ?? 10.0,
          fixedFee: fixedFee ?? 0.0,
          subscriptionFee: subscriptionFee ?? 0.0,
          subscriptionEndsAt,
        }
      });
    });

    return NextResponse.json(vendor);
  } catch (error: any) {
    console.error("Admin Create Vendor Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — موافقة أو رفض بائع
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const emailLower = (session as any)?.user?.email?.trim().toLowerCase();
    const SUPER_ADMINS = ["blackhatsd.sd@gmail.com", "system@mersal.com", "hazem@mersal.com", "zomatube2012@gmail.com"];
    
    if (!emailLower || (!SUPER_ADMINS.includes(emailLower) && (session as any).user.role !== 'ADMIN')) {
      return adminOnlyResponse();
    }

    const { id, action, reason } = await req.json();
    if (!id || !action) return NextResponse.json({ error: "Missing ID or Action" }, { status: 400 });

    let status;
    if (action === 'APPROVE') status = 'APPROVED';
    else if (action === 'REJECT') status = 'REJECTED';
    else if (action === 'SUSPEND') status = 'SUSPENDED';
    else if (action === 'ACTIVATE') status = 'APPROVED';
    else return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: { 
        status,
        rejectionReason: action === 'REJECT' ? reason || null : null,
        subscriptionEndsAt: action === 'APPROVE' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined
      },
    });

    if (action === 'APPROVE') {
      await prisma.user.update({
        where: { id: updatedVendor.userId },
        data: { role: 'VENDOR' }
      });
    }

    return NextResponse.json(updatedVendor);
  } catch (error: any) {
    console.error("Admin Update Vendor Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const emailLower = (session as any)?.user?.email?.trim().toLowerCase();
    const SUPER_ADMINS = ["blackhatsd.sd@gmail.com", "system@mersal.com", "hazem@mersal.com", "zomatube2012@gmail.com"];
    
    if (!emailLower || (!SUPER_ADMINS.includes(emailLower) && (session as any).user.role !== 'ADMIN')) {
      return adminOnlyResponse();
    }

    const { id } = await req.json();
    await prisma.vendor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const emailLower = (session as any)?.user?.email?.trim().toLowerCase();
    const SUPER_ADMINS = ["blackhatsd.sd@gmail.com", "system@mersal.com", "hazem@mersal.com", "zomatube2012@gmail.com"];
    
    if (!emailLower || (!SUPER_ADMINS.includes(emailLower) && (session as any).user.role !== 'ADMIN')) {
      return adminOnlyResponse();
    }

    const body = await req.json();
    const { 
      id, storeName, ownerName, ownerEmail, ownerPassword, phone, location,
      commissionType, commissionRate, fixedFee, subscriptionFee, subscriptionEndsAt 
    } = body;

    if (!id) return NextResponse.json({ error: "Missing Vendor ID" }, { status: 400 });

    const vendor = await prisma.vendor.findUnique({ where: { id }, include: { user: true } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const updateData: any = {};
    if (storeName) updateData.storeName = storeName;
    if (location) updateData.location = location;
    if (phone) updateData.phone = phone;
    if (commissionType) updateData.commissionType = commissionType;
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate;
    if (fixedFee !== undefined) updateData.fixedFee = fixedFee;
    if (subscriptionFee !== undefined) updateData.subscriptionFee = subscriptionFee;
    if (subscriptionEndsAt !== undefined) updateData.subscriptionEndsAt = subscriptionEndsAt;

    const userUpdateData: any = {};
    if (ownerName) userUpdateData.name = ownerName;
    if (ownerEmail) userUpdateData.email = ownerEmail;
    if (phone) userUpdateData.phone = phone;

    if (ownerPassword) {
      const bcrypt = await import("bcryptjs");
      userUpdateData.password = await bcrypt.default.hash(ownerPassword, 12);
    }

    const updatedVendor = await prisma.$transaction(async (tx: any) => {
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: vendor.userId },
          data: userUpdateData
        });
      }
      return await tx.vendor.update({
        where: { id },
        data: updateData,
        include: { user: true }
      });
    });

    return NextResponse.json(updatedVendor);
  } catch (error: any) {
    console.error("Admin Update Vendor Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

