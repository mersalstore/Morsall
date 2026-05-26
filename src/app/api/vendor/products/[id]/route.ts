import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        vendor: { select: { userId: true } },
        productAttributes: true,
        variations: true,
      } as any,
    }) as any;

    if (!product || product.vendor?.userId !== userId) {
      return NextResponse.json({ error: "Product not found or access denied" }, { status: 403 });
    }

    const { vendor: _vendor, ...data } = product;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { vendor: true }
    });

    if (!existing || existing.vendor.userId !== userId) {
      return NextResponse.json({ error: "Product not found or access denied" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title, description, shortDescription, price, stock, images, categoryId,
      brand, range, type, sku, weight, length, width, height,
      discountPrice, discountType, bundleData,
      productAttributes, variations, specifications
    } = body;

    const numericPrice = price !== undefined ? parseFloat(price) : existing.price;
    const numericStock = stock !== undefined ? parseInt(stock) : existing.stock;

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id },
        data: {
          title: title ?? existing.title,
          description: description !== undefined ? description : existing.description,
          shortDescription: shortDescription !== undefined ? shortDescription : existing.shortDescription,
          price: numericPrice,
          stock: numericStock,
          images: images !== undefined ? (Array.isArray(images) ? images.join(",") : images) : existing.images,
          brand: brand !== undefined ? brand : existing.brand,
          range: range !== undefined ? range : existing.range,
          type: type ?? existing.type,
          sku: sku !== undefined ? sku : existing.sku,
          weight: weight !== undefined ? (weight ? parseFloat(weight) : null) : existing.weight,
          length: length !== undefined ? (length ? parseFloat(length) : null) : existing.length,
          width: width !== undefined ? (width ? parseFloat(width) : null) : existing.width,
          height: height !== undefined ? (height ? parseFloat(height) : null) : existing.height,
          discountPrice: discountPrice !== undefined ? (discountPrice ? parseFloat(discountPrice) : null) : existing.discountPrice,
          discountType: discountType !== undefined ? discountType : existing.discountType,
          bundleData: bundleData !== undefined ? bundleData : existing.bundleData,
          categoryId: categoryId ?? existing.categoryId,
          status: existing.status,
        }
      });

      // Update product attributes
      if (productAttributes && Array.isArray(productAttributes)) {
        await tx.productAttribute.deleteMany({ where: { productId: id } });
        if (productAttributes.length > 0) {
          await tx.productAttribute.createMany({
            data: productAttributes.map((attr: any) => ({
              productId: id,
              name: attr.name,
              values: attr.values
            }))
          });
        }
      }

      // Update variations
      if (variations && Array.isArray(variations)) {
        await tx.productVariation.deleteMany({ where: { productId: id } });
        if (variations.length > 0) {
          await tx.productVariation.createMany({
            data: variations.map((v: any) => ({
              productId: id,
              sku: v.sku || null,
              price: v.price ? parseFloat(v.price) : numericPrice,
              stock: parseInt(v.stock) || 0,
              combination: JSON.stringify(v.combination || {}),
              image: Array.isArray(v.images) ? v.images[0] : v.image || null
            }))
          });
        }
      }

      // Update specifications
      if (specifications !== undefined) {
        await tx.product.update({
          where: { id },
          data: { specifications: typeof specifications === 'string' ? specifications : JSON.stringify(specifications) }
        });
      }

      return p;
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("VENDOR PRODUCT UPDATE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { vendor: true }
    });

    if (!product || product.vendor.userId !== userId) {
      return NextResponse.json({ error: "Product not found or access denied" }, { status: 403 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Product Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
