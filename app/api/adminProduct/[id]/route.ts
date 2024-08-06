import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function PUT(
    request: Request,
    { params, body }: { params: { id: number }; body: any }
  ) {
  const { searchParams } = new URL(request.url);
  const id = params.id;
    console.log(searchParams.get("id"))
  if (!id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  const data = await request.json();

  try {
    const updatedProduct = await prisma.product.update({
      where: {
        id: Number(id),
      },
      data: {
        portalStock: data.portalStock,
        promotionId: data.promotionId,
        years: JSON.stringify(data.years),
        lv1Id: data.lv1Id,
        lv2Id: data.lv2Id,
        lv3Id: data.lv3Id,
        imageProducts: {
          deleteMany: {}, // Deletes all related images before re-inserting
          create: data.imageProducts.map((image: { url: string }) => ({ url: image.url })),
        },
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
