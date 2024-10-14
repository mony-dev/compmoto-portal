import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "1000");
  try {
    const [minisizes, total] = await Promise.all([
      prisma.minisize.findMany({
        where: {
          OR: [{ name: { contains: q, mode: "insensitive" } }],
        },
        include: {
          brands: {   // Accessing the join table BrandMinisize
            include: {
              brand: {  // Access the Brand from the join table
                include: {
                  products: true,  // Including products under each Brand
                },
              },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.minisize.count({
        where: {
          OR: [{ name: { contains: q, mode: "insensitive" } }],
        },
      }),
    ]);
    const minisizesWithProductCount = minisizes.map((minisize: any) => {
      const productCount = minisize.brands.reduce(
        (acc: number, brandMinisize: any) => acc + brandMinisize.brand.products.length,
        0
      );
      return {
        ...minisize,
        productCount,
      };
    });
    return NextResponse.json({ minisizes: minisizesWithProductCount, total });
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
        name: data.name,
        imageProfile: data.imageProfile,
        isActive: data.isActive,
        lv1: JSON.stringify(data.lv1),
        lv2: JSON.stringify(data.lv2),
        lv3: JSON.stringify(data.lv3),
        mediaBanner: data.mediaBanner,
        newsBanner: data.newsBanner
      },
    });
    await prisma.brandMinisize.createMany({
      data: data.brandIds.map((brandId: number) => ({
        brandId: brandId,
        minisizeId: newMinisize.id,
      })),
    });

    // Update the products based on brand IDs
    await prisma.product.updateMany({
      where: {
        brandId: { in: data.brandIds },
      },
      data: {
        minisizeId: newMinisize.id,
      },
    });

    return NextResponse.json(newMinisize);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
