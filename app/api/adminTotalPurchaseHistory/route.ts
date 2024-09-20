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

    // Prepare the response data
    const totalPurchaseHistories = totalPurchase.totalPurchaseHistories.map((history) => ({
      key: history.id,
      id: history.id,
      user: {
        userId: history.user.id,
        name: history.user.name,
        custNo: history.user.custNo
      },
      totalSpend: history.totalSpend,
      cn: history.cn,
      intensivePoint: history.incentivePoint,
      royaltyPoint: history.loyaltyPoint,
      level: history.level,
    }));

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
