import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const specialBonusId = searchParams.get("specialBonusId");
  const page = 1;
  const pageSize = 50;

  if (!userId || !specialBonusId) {
    return NextResponse.json(
      { error: "User ID and SpecialBonus ID are required" },
      { status: 400 }
    );
  }

  try {
    // Fetch SpecialBonusHistory for the given user and specialBonusId
    const specialBonusHistory = await prisma.specialBonusHistory.findFirst({
      where: {
        userId: parseInt(userId),
        specialBonusId: parseInt(specialBonusId),
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    if (!specialBonusHistory) {
      return NextResponse.json({ data: [], total: 0 });
    }

    // Fetch active special bonus along with its items and minisize brands
    const activeSpecialBonus = await prisma.specialBonus.findFirst({
      where: { id: parseInt(specialBonusId), isActive: true },
      include: {
        items: {
          include: {
            minisize: {
              include: { brands: true },
            },
          },
        },
      },
    });

    if (!activeSpecialBonus) {
      return NextResponse.json(
        { error: "Active Special Bonus not found" },
        { status: 404 }
      );
    }

    const totalSpend = specialBonusHistory.totalSpend; 
    const minisizeTotalSpend = await mapTotalSpendToMinisize(
      totalSpend,
      activeSpecialBonus.items
    );

    return NextResponse.json({
      data: {
        ...specialBonusHistory,
        totalSpend: minisizeTotalSpend
      },
      total: 1,
    });
  } catch (error) {
    console.error("Error fetching special bonus history:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the data" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Function to map totalSpend to minisizeId
async function mapTotalSpendToMinisize(totalSpend: any, activeSpecialBonusItems: any[]) {
  const minisizeTotalSpend: { minisizeId: number; total: number; level: number }[] = [];
  // Iterate through each activeSpecialBonusItem
  activeSpecialBonusItems.forEach((bonusItem) => {
    const { minisize, minisizeId } = bonusItem;
    // Find all totals in totalSpend where brandId matches any of the brands in minisize
    const matchingSpend = totalSpend.filter((spend: { brandId: number; }) =>
      minisize.brands.some((brand: { brandId: number; }) => brand.brandId === spend.brandId)
    );
    if (matchingSpend.length > 0) {
      // Sum the total values for matching brandIds
      const totalSum = matchingSpend.reduce((sum: number, spend: { total: number; }) => sum + spend.total, 0);
      const level = matchingSpend[0]?.level;

      // Check if minisizeId already exists in minisizeTotalSpend array
      const existingEntry = minisizeTotalSpend.find((entry) => entry.minisizeId === minisizeId);

      if (existingEntry) {
        // If minisizeId already exists, add the current totalSum to the existing total
        existingEntry.total = totalSum;
        existingEntry.level = level;
      } else {
        // Otherwise, add a new entry for this minisizeId
        minisizeTotalSpend.push({
          minisizeId: minisizeId,
          total: totalSum,
          level: level
        });
      }
    }
  });
  return minisizeTotalSpend;
}
