import { PrismaClient, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get('month');
  const yearParam = searchParams.get('year');
  const isActiveParam = searchParams.get('isActive');

  
  const month = monthParam ? parseInt(monthParam) : null;
  const year = yearParam ? parseInt(yearParam) : null;
  const isActive = isActiveParam ? parseInt(isActiveParam) : true;

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "15");
  const skip = (page - 1) * pageSize;

  try {
    // Step 1: Find active SpecialBonus
    const whereCondition: any = {
      ...(isActive && { isActive }),
      ...(month && { month }),   // Add month to the filter if provided
      ...(year && { year }),     // Add year to the filter if provided
    };
    const specialBonus = await prisma.specialBonus.findFirst({
      where: whereCondition,
      include: {
        items: {
          include: {
            brand: true, // Fetch associated brand details
          }
        }
      }
    });

    if (!specialBonus) {
      return NextResponse.json({ error: "No active SpecialBonus found" });
    }

    // Step 2: Fetch SpecialBonusHistory and join with User and totalSpend data
    const specialBonusHistories = await prisma.specialBonusHistory.findMany({
      where: {
        specialBonusId: specialBonus.id,
      },
      include: {
        user: true,  // Join with User
      },
      skip,
      take: pageSize,
    });

    // Step 3: Format the data to match DataType interface, avoiding duplicates
    const formattedData = specialBonusHistories.map((history) => {
      const totalSpendData = (history.totalSpend && Array.isArray(history.totalSpend)) ? history.totalSpend : [];

      type TotalSpendType = {
        brandId: number;
        brandName: string;
        total: number;
        level: number;
        cn: number;
        intensivePoint: number;
      };

      // Create a map to prioritize entries with a level and cn
      const totalSpendMap: Record<number, TotalSpendType> = {};

      // Iterate through specialBonus items
      specialBonus.items.forEach(item => {
        const spendEntry = totalSpendData.find((entry: any) => 
          typeof entry === 'object' && entry !== null && 'brandId' in entry && entry.brandId === item.brandId
        ) as { brandId: number; total?: number; level?: number } | undefined;

        const total = spendEntry?.total || 0;
        const level = spendEntry?.level || 0;

        // Determine cn and intensivePoint based on level and order
        const cn = (level === item.order) ? item.cn : 0;
        const intensivePoint = (level === item.order) ? item.incentivePoint : 0;

        // Prioritize entries with a non-zero level and cn
        if (!totalSpendMap[item.brandId] || (cn > 0 && level > 0)) {
          totalSpendMap[item.brandId] = {
            brandId: item.brandId,
            brandName: item.brand.name,
            total,
            level,
            cn,
            intensivePoint,
          };
        }
      });

      // Convert the map to an array of totalSpend values
      const totalSpend = Object.values(totalSpendMap);

      return {
        key: history.id,
        id: history.id,
        user: {
          userId: history.user.id,
          name: history.user.name || 'N/A',
          custNo: history.user.custNo
        },
        totalSpend,
        cn: history.cn,
        intensivePoint: history.incentivePoint,
      };
    });

    // Step 4: Count total for pagination
    const total = await prisma.specialBonusHistory.count({
      where: {
        specialBonusId: specialBonus.id,
      }
    });

    return NextResponse.json({ specialBonusHistories: formattedData, total });
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
