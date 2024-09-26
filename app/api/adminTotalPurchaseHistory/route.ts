import { PrismaClient } from "@prisma/client";
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
    // Query for active TotalPurchase
    const whereCondition: any = {
      ...(isActive && { isActive }),
      ...(month && { month }),   // Add month to the filter if provided
      ...(year && { year }),     // Add year to the filter if provided
    };
    const totalPurchase = await prisma.totalPurchase.findFirst({
      where: whereCondition,
      include: {
        totalPurchaseHistories: {
          include: {
            user: true,  // Include related user data
          },
          skip,
          take: pageSize,
        },
      },
    });

    if (!totalPurchase) {
      return NextResponse.json({totalPurchaseHistories: null, total : 0});
    }

    let startDate = null
    let endDate = null
    if (totalPurchase.month && totalPurchase.year){
      startDate = new Date(totalPurchase.year, totalPurchase.month - 1, 1); // First day of the month
      endDate = new Date(totalPurchase.year, totalPurchase.month, 0); // Last day of the month
    }

    const totalPurchaseHistories = await Promise.all(
      totalPurchase.totalPurchaseHistories.map(async (history) => {
        const userId = history.user.id;
        let memoCreditSum =  0;
        if (startDate && endDate) {
          const memoCreditSumResult = await prisma.memoCredit.aggregate({
            where: {
              userId: Number(userId),
              AND: [{ date: { gte: startDate } }, { date: { lt: endDate } }],
            },
            _sum: {
              totalAmount: true,
            },
          });
          memoCreditSum = memoCreditSumResult._sum.totalAmount ?? 0;
        }
        const adjustedTotalSpend = history.totalSpend - memoCreditSum;

        return {
          key: history.id,
          id: history.id,
          user: {
            userId: history.user.id,
            name: history.user.name,
            custNo: history.user.custNo
          },
          totalSpend: adjustedTotalSpend,
          cn: history.cn,
          intensivePoint: history.incentivePoint,
          royaltyPoint: history.loyaltyPoint,
          level: history.level,
        };
      })
    );

    // Get the total number of histories for pagination
    const total = await prisma.totalPurchaseHistory.count({
      where: { totalPurchaseId: totalPurchase.id },
    });

    return NextResponse.json({ totalPurchaseHistories, total });
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
