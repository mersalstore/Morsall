import { getAdminSession, adminOnlyResponse } from "@/lib/session";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Fetch Plans Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const { name, price, durationDays, isTrial } = await req.json();

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        price: parseFloat(price),
        durationDays: parseInt(durationDays),
        isTrial: !!isTrial
      }
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Create Plan Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const { id, name, price, durationDays, isTrial } = await req.json();

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name,
        price: parseFloat(price),
        durationDays: parseInt(durationDays),
        isTrial: !!isTrial
      }
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Update Plan Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.subscriptionPlan.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Plan Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
