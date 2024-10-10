import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: number } }
) {
  const data = await request.json();
  const id = Number(params.id);

  interface dataBodyInterface {
    name: string;
    isActive: boolean;
    lv1: string;
    lv2: string;
    lv3: string;
    imageProfile: string;
    mediaBanner: string;
    newsBanner: string;
  }

  let dataBody: dataBodyInterface = {
    name: data.name,
    isActive: data.isActive,
    lv1: JSON.stringify(data.lv1),
    lv2: JSON.stringify(data.lv2),
    lv3: JSON.stringify(data.lv3),
    imageProfile: data.imageProfile,
    mediaBanner: data.mediaBanner,
    newsBanner: data.newsBanner,
  };

  try {
    // Update the minisize
    const updatedMinisize = await prisma.minisize.update({
      where: {
        id: id,
      },
      data: dataBody,
    });

    // Remove old brand relations from BrandMinisize
    await prisma.brandMinisize.deleteMany({
      where: {
        minisizeId: id,
      },
    });

    // Add new brand relations to BrandMinisize
    await prisma.brandMinisize.createMany({
      data: data.brandIds.map((brandId: number) => ({
        brandId: brandId,
        minisizeId: id,
      })),
    });

    // Update products based on the updated brands
    await prisma.product.updateMany({
      where: {
        brandId: { in: data.brandIds },
      },
      data: {
        minisizeId: id,
      },
    });

    return NextResponse.json(updatedMinisize);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}


export async function DELETE(
  request: Request,
  { params }: { params: { id: number } }
) {
  const id = Number(params.id);
  const body = await request.json();
  const { cascade } = body;

  try {
    // Remove relations from BrandMinisize before deleting the minisize
    await prisma.brandMinisize.deleteMany({
      where: { minisizeId: id },
    });

    if (cascade) {
      // Update related records to set minisizeId to null instead of deleting them
      await prisma.product.updateMany({
        where: { minisizeId: id },
        data: { minisizeId: null },
      });
      await prisma.promotion.deleteMany({
        where: { minisizeId: id },
      });
      await prisma.media.deleteMany({ where: { minisizeId: id } });
      await prisma.news.deleteMany({ where: { minisizeId: id } });
    }

    // Delete the Minisize itself
    const deleted = await prisma.minisize.delete({
      where: { id: id },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    return NextResponse.json({ message: "Error deleting minisize", error });
  } finally {
    await prisma.$disconnect();
  }
}


export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  const id = params.id;
  try {
    const minisize = await prisma.minisize.findUnique({
      where: {
        id: Number(id),
      },
    });
    return NextResponse.json(minisize);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

