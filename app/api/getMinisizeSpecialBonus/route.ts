import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = 1;
  const pageSize = 200;

  try {
    const [minisizes, total] = await Promise.all([
      prisma.minisize.findMany({
        where: {
          isActive: true,
          specialBonusItem: {
            some: {
              specialBonus: {
                isActive: true,
              },
            },
          },
        },
        select: {
          id: true, // Fetch only the minisizeId
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.minisize.count({
        where: {
          isActive: true,
          specialBonusItem: {
            some: {
              specialBonus: {
                isActive: true,
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({ minisizes: minisizes.map((m) => m.id), total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
