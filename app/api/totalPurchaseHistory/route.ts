import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "1000");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Query the active TotalPurchaseHistory for the user
    const [totalPurchaseHistory, total] = await Promise.all([
      prisma.totalPurchaseHistory.findMany({
        where: {
          userId: parseInt(userId),
          totalPurchase: {
            isActive: true,
          },
        },
        include: {
          totalPurchase: {
            include: {
              items: {
                orderBy: {
                  order: "asc",
                },
              },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.totalPurchaseHistory.count({
        where: {
          userId: parseInt(userId),
          totalPurchase: {
            isActive: true,
          },
        },
      }),
    ]);
    if (!totalPurchaseHistory.length) {
      // If no history, fetch the active TotalPurchase and items to display them as inactive
      const totalPurchase = await prisma.totalPurchase.findMany({
        where: {
          isActive: true,
        },
        include: {
          items: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      if (!totalPurchase.length) {
        return NextResponse.json({ totalPurchaseHistory: [], total });
      }

      // Prepare inactive items response
      const inactiveItems = totalPurchase[0].items.map((item) => ({
        id: item.id,
        totalPurchaseAmount: item.totalPurchaseAmount,
        cn: item.cn,
        incentivePoint: item.incentivePoint,
        loyaltyPoint: item.loyaltyPoint,
        order: item.order,
        isActive: false, // Mark as inactive
      }));

      return NextResponse.json({
        totalPurchaseHistory: [
          {
            id: null,
            userId: parseInt(userId),
            totalSpend: 0,
            level: 0, // No level as there's no active history
            cn: 0,
            incentivePoint: 0,
            loyaltyPoint: 0,
            items: inactiveItems,
          },
        ],
        total,
      });
    }

    // Prepare the response data
    const responseData = totalPurchaseHistory.map((history) => ({
      id: history.id,
      userId: history.userId,
      totalSpend: history.totalSpend,
      level: history.level,
      cn: history.cn,
      incentivePoint: history.incentivePoint,
      loyaltyPoint: history.loyaltyPoint,
      items: history.totalPurchase.items.map((item) => ({
        id: item.id,
        totalPurchaseAmount: item.totalPurchaseAmount,
        cn: item.cn,
        incentivePoint: item.incentivePoint,
        loyaltyPoint: item.loyaltyPoint,
        order: item.order,
      })),
    }));

    // Extract month and year from TotalPurchase
    const activePurchase = await prisma.totalPurchase.findFirst({
      where: {
        isActive: true,
      },
    });

    let sumTotalAmount = 0;
    if (activePurchase) {
      const { month, year } = activePurchase;
      // Query MemoCredit to sum totalAmount for the extracted month and year
      const startDate = new Date(year, month - 1, 1); // JS Date months are 0-indexed
      const endDate = new Date(year, month, 1); // First day of next month

      const memoCreditSum = await prisma.memoCredit.aggregate({
        where: {
          userId: parseInt(userId),
          AND: [{ date: { gte: startDate } }, { date: { lt: endDate } }],
        },
        _sum: {
          totalAmount: true,
        },
      });

      // Add memoCreditSum to the response if it exists
      sumTotalAmount = memoCreditSum._sum.totalAmount || 0;
    }
    return NextResponse.json({
      totalPurchaseHistory: responseData,
      total: total,
      sumTotalAmount: sumTotalAmount,
    });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
