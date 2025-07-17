import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

type UserWithRewardPoint = {
  id: number | null;
  name: string | null;
  custNo: string | null;
  point: number;
  incentivePoint: number;
  loyaltyPoint: number;
  usedPoint: number;
  totalPoint: number;
  totalSpend: number;
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "15");
  try {
    // Fetch the first active TotalPurchase
    const rewardPoint = await prisma.rewardPoint.findFirst({
      where: {
        month: Number(monthParam),
        year: Number(yearParam),
      }
    });
    if (rewardPoint) {
      const allUsers = await prisma.user.findMany({
        where: {
          role: "USER"
        },
      });
    
      const histories = await prisma.rewardPointHistory.findMany({
        where: {
          rewardPointId: rewardPoint.id, 
        },
        include: {
          user: true,
        },
      });
    
      const userMap = new Map<number, typeof histories[0]>();
    
      histories.forEach((history) => {
        userMap.set(history.userId, history);
      });
      
      const merged: UserWithRewardPoint[] = allUsers.map((user) => {
        const history = userMap.get(user.id);
        return {
          id: user.id,
          name: user.name,
          custNo: user.custNo,
          point: history?.point ?? 0,
          incentivePoint: history?.incentivePoint ?? 0,
          loyaltyPoint: history?.loyaltyPoint ?? 0,
          usedPoint: history?.usedPoint ?? 0,
          totalPoint: history?.totalPoint ?? 0,
          totalSpend: history?.totalSpend ?? 0,
        };
      });
      const total = merged.length;
      const startIndex = (page - 1) * pageSize;
      const paginated = merged.slice(startIndex, startIndex + pageSize);

      return NextResponse.json({
        rewardPoint,
        histories: paginated,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    }
 

    return NextResponse.json({ rewardPoint });
  } catch (error) {
    console.error("Error fetching rewardPoint:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const month = new Date(data.month).getMonth() + 1; 
    const year = new Date(data.year).getFullYear(); 

    // Create TotalPurchase first
    const rewardPoint = await prisma.rewardPoint.create({
      data: {
        month, // Save month as 1-12
        year,  // Save year as 2024,
        name: data.name,
        customerGroupId: data.customerGroupId,
        resetDate: new Date(data.resetDate), 
        isFinalize: data.isFinalize, 
        expenses: data.expenses,
        point: data.point,
        specialBonusId: data.specialBonusId,
        totalPurchaseId: data.totalPurchaseId,

      },
    });

    return NextResponse.json({ rewardPoint });
  } catch (error) {
    console.error("Error creating Reward Point:", error);
    return NextResponse.json({ error: "An error occurred" });
  } finally {
    await prisma.$disconnect();
  }
}