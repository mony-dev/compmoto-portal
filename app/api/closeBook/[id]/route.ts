import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  try {
    const data = await request.json();

    const { id } = data;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required for updating" },
        { status: 400 }
      );
    }
    const rewardPoint = await prisma.rewardPoint.update({
      where: { id },
      data: data, // Update only the fields that were passed
    });

    const rewardPointHistory = await prisma.rewardPointHistory.findMany({
      where: {
        rewardPointId: id,
      },
    });

    for (const history of rewardPointHistory) {
      const user = await prisma.user.findFirst({
        where: { id: history.userId },
      });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            rewardPoint: user.rewardPoint + history.totalPoint,
          },
        });
      }
    }
    return NextResponse.json({ rewardPoint });
  } catch (error) {
    console.error("Error updating TotalPurchase:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
