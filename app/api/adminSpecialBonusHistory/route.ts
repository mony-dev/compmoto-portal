import { PrismaClient, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

type TotalSpendEntry = {
  brandId: number;
  total: number;
  level: number;
};

type TotalSpendType = {
  minisizeId: number;
  minisizeName: string;
  total: number;
  level: number;
  cn: number;
  intensivePoint: number;
};

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
            minisize: {
              include: { brands: true },
            },
          },
        },
      },
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
      const totalSpendData = (history.totalSpend && Array.isArray(history.totalSpend)) ? history.totalSpend as TotalSpendEntry[] : [];
    
      type TotalSpendType = {
        minisizeId: number;
        minisizeName: string;
        total: number;
        level: number;
        cn: number;
        intensivePoint: number;
        processedBrandIds: Set<number>;  // Add a Set to track processed brandIds for each minisizeId
      };
    
      // Create a map to aggregate spend data by minisizeId
      const totalSpendMap: Record<number, TotalSpendType> = {};
    
      // Iterate through specialBonus items
      specialBonus.items.forEach(item => {
        const minisizeId = item.minisizeId;
        
        const minisizeBrandIds = item.minisize.brands.map(brandRelation => brandRelation.brandId);

        // Filter totalSpendData for entries that match the current item's brandId and ensure no duplicates
        const relatedSpendEntries = totalSpendData.filter((spendEntry: TotalSpendEntry) => 
          minisizeBrandIds.includes(spendEntry.brandId)
        );
        // Initialize the map entry for the minisizeId if not already present
        if (!totalSpendMap[minisizeId]) {
          totalSpendMap[minisizeId] = {
            minisizeId,
            minisizeName: item.minisize.name,
            total: 0,
            level: 0,
            cn: 0,
            intensivePoint: 0,
            processedBrandIds: new Set<number>(),  // Initialize the set for processedBrandIds
          };
        }
    
        // If there are matching spend entries, update the total and points
        relatedSpendEntries.forEach(spendEntry => {
          const total = spendEntry.total || 0;
          const level = spendEntry.level || 0;
    
          // Check if the brandId has already been processed for this minisizeId
          if (!totalSpendMap[minisizeId].processedBrandIds.has(spendEntry.brandId)) {
            // Only add the total if the brandId has not been processed yet
            totalSpendMap[minisizeId].total += total;
            totalSpendMap[minisizeId].processedBrandIds.add(spendEntry.brandId);  // Mark the brandId as processed
          }
    
          // Sum cn and intensivePoint based on the level and order
          const cn = (level === item.order) ? item.cn : 0;
          const intensivePoint = (level === item.order) ? item.incentivePoint : 0;
    
          // Update totals and points for the minisizeId
          totalSpendMap[minisizeId].cn += cn;
          totalSpendMap[minisizeId].intensivePoint += intensivePoint;
    
          // Adjust level if necessary (e.g., take the highest level)
          totalSpendMap[minisizeId].level = Math.max(totalSpendMap[minisizeId].level, level);
        });
      });
    
      // Convert the map to an array of totalSpend values grouped by minisize
      const totalSpend = Object.values(totalSpendMap).map(({ processedBrandIds, ...rest }) => rest);  // Exclude processedBrandIds
    
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
