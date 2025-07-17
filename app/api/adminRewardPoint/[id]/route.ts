import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// export async function PUT(request: Request) {
//   try {
//     const data = await request.json();

//     const { id } = data;

//     if (!id) {
//       return NextResponse.json({ error: "ID is required for updating" }, { status: 400 });
//     }
//     const rewardPoint = await prisma.rewardPoint.update({
//       where: { id },
//       data: data, // Update only the fields that were passed
//     });

//     return NextResponse.json({ rewardPoint });
//   } catch (error) {
//     console.error("Error updating TotalPurchase:", error);
//     return NextResponse.json({ error: "An error occurred" }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
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

export async function PUT(request: Request) {
  try {
    const data = await request.json();

    const { id, name, isFinalize } = data;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required for updating" },
        { status: 400 }
      );
    }

    const rewardPoint = await prisma.rewardPoint.update({
      where: { id },
      data: { isFinalize: isFinalize, name: name }, // Update only the fields that were passed
    });

    return NextResponse.json({ rewardPoint });
  } catch (error) {
    console.error("Error updating Reward Point:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


  export async function GET(
    request: Request,
    { params }: { params: { id: number } }
  ) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "15");
  const id = params.id; 
  
  try {
    const rewardPoint = await prisma.rewardPoint.findUnique({
      where: {
        id: Number(id),
      }
    });
    if (rewardPoint) {
      const allUsers = await prisma.user.findMany({
        where: {
          role: "USER",
          customerGroupId: rewardPoint.customerGroupId
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
      const userMap = new Map<number, (typeof histories)[0]>();

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
