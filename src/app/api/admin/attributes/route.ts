import { getAdminSession, adminOnlyResponse } from "@/lib/session";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  const attributes = await prisma.attribute.findMany({
    include: { options: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(attributes);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  const { name, options } = await req.json();

  if (!name || !options || !Array.isArray(options)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const attribute = await prisma.attribute.create({
      data: {
        name,
        options: {
          create: options.map((opt: string) => ({ value: opt }))
        }
      },
      include: { options: true }
    });

    return NextResponse.json(attribute);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "هذا المتغير موجود مسبقاً" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  const { id } = await req.json();

  await prisma.attribute.delete({
    where: { id }
  });

  return NextResponse.json({ success: true });
}
