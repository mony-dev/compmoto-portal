import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");
  try {
    const [medias, total] = await Promise.all([
      prisma.media.findMany({
        where: {
          OR: [{ name: { contains: q, mode: "insensitive" } }],
        },
        include: {
          minisize: true
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.media.count({
        where: {
          OR: [{ name: { contains: q, mode: "insensitive" } }],
        },
      }),
    ]);

    const mediasWithProductCount = medias.map((media: any) => ({
      ...media
    }));
    return NextResponse.json({ medias: mediasWithProductCount, total });
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
        brandProductId: data.brandId,
        name: data.name,
        imageProfile: data.imageProfile,
        isActive: data.isActive,
        lv1: JSON.stringify(data.lv1),
        lv2: JSON.stringify(data.lv2),
        lv3: JSON.stringify(data.lv3),
      },
    });
    const updatedProducts = await prisma.product.updateMany({
      where: {
        brandId: Number(data.brandId),
      },
      data: {
        minisizeId: Number(newMinisize.id),
      },
    });
    return NextResponse.json(newMinisize);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
