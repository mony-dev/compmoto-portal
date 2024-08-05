import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  try {
    const products = await prisma.product.findMany({
        where: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { code: { contains: q, mode: "insensitive" } },
            ],
          },
      include: {
        brand: {
          select: {
            name: true,
          },
        },
        minisize: {
          select: {
            name: true,
            lv1: true,
            lv2: true,
            lv3: true,
          },
        },
        promotion: {
          select: {
            name: true,
          },
        },
      },
    });

    const detailedProducts = await Promise.all(
      products.map(async (product) => {
        const lv1Data = product.minisize?.lv1 as { data: string; name: string, isActive: boolean };
        const lv2Data = product.minisize?.lv2 as { data: string; name: string, isActive: boolean };
        const lv3Data = product.minisize?.lv3 as { data: string; name: string, isActive: boolean};

        const lv1Table = lv1Data?.data;
        const lv2Table = lv2Data?.data;
        const lv3Table = lv3Data?.data;
        const lv1Name = lv1Table
          ? await (prisma as any)[lv1Table].findUnique({
              where: { id: product.lv1Id },
              select: { name: true },
            })
          : null;

        const lv2Name = lv2Table
          ? await (prisma as any)[lv2Table].findUnique({
              where: { id: product.lv2Id },
              select: { name: true },
            })
          : null;

        const lv3Name = lv3Table
          ? await (prisma as any)[lv3Table].findUnique({
              where: { id: product.lv3Id },
              select: { name: true },
            })
          : null;
          
        return {
          ...product,
          lv1Name: lv1Name?.name || null,
          lv2Name: lv2Name?.name || null,
          lv3Name: lv3Name?.name || null,
        };
      })
    );

    return NextResponse.json(detailedProducts);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newMinisize = await prisma.minisize.create({
      data: {
        brandId: data.brandId,
        name: data.name,
        isActive: data.isActive,
        lv1: JSON.stringify(data.lv1),
        lv2: JSON.stringify(data.lv2),
        lv3: JSON.stringify(data.lv3),
      },
    });
    return NextResponse.json(newMinisize);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
